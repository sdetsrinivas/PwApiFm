/**
 * Schema Validator Helper
 *
 * This module provides two schema validation methods:
 * 1. validateSchema() - Uses AJV library for JSON Schema validation
 * 2. assertSchema() - Uses Zod library for TypeScript schema validation
 *
 * Both methods return a consistent error structure with:
 * - path: location of the validation error
 * - message: error description
 * - expected: expected value/type
 * - received: actual received value
 */

import Ajv from "ajv";
import { ZodType } from "zod";

/**
 * AJV Instance Configuration
 * - allErrors: true - collect all validation errors instead of stopping at first
 * - verbose: true - include additional metadata in error details
 */
const ajv = new Ajv({ allErrors: true, verbose: true });

/**
 * Validates data against a JSON Schema using AJV
 *
 * @param schema - JSON Schema to validate against
 * @param data - Data to validate
 * @returns Object containing validation result with errors array
 *
 * @example
 * const result = validateSchema(userSchema, responseBody);
 * if (result.valid) {
 *   console.log("Validation passed");
 * } else {
 *   console.log(result.errors); // Array of validation errors
 * }
 */
export function validateSchema(schema: any, data: any) {
  // Compile the schema into a reusable validation function
  const validate: any = ajv.compile(schema);
  const valid = validate(data);

  // Extract errors array, handling cases where it might be null
  const rawErrors: any[] = Array.isArray(validate.errors)
    ? validate.errors
    : [];

  /**
   * ValidationError structure consistent with Zod output
   * Ensures both AJV and Zod validators return the same format
   */
  type ValidationError = {
    path: string[];
    message: string;
    expected: unknown | null;
    received: unknown | null;
  };

  // Transform AJV errors into our standardized format
  const errors: ValidationError[] = rawErrors.map((e: any) => {
    // Parse the JSON Pointer path to get an array of keys
    // AJV uses `instancePath` in newer versions, `dataPath` in older ones
    const pointer: string = e.instancePath ?? e.dataPath ?? "";
    const path = pointer
      ? pointer.split("/").filter((s: string) => s.length > 0)
      : [];

    // Extract the expected value from AJV error params
    // Different validation failures provide different param types
    let expected: unknown | null = null;
    if (e.params) {
      if (e.params.allowedValues !== undefined)
        expected = e.params.allowedValues; // For enum/allowed values
      else if (e.params.type !== undefined)
        expected = e.params.type; // For type mismatches
      else if (e.params.format !== undefined) expected = e.params.format; // For format validation
    }

    // Navigate through the data object using the error path to get the received value
    let received: unknown | null = null;
    if (path.length > 0) {
      received = data;
      for (const key of path) {
        received = (received as any)?.[key];
      }
    } else {
      // If no path, the error is at root level
      received = data;
    }

    return {
      path: path.map(String),
      message: String(e.message ?? ""),
      expected: expected === undefined ? null : expected,
      received: received === undefined ? null : received,
    };
  });

  return { valid, errors };
}

/**
 * Validates data against a Zod schema
 * Internal helper function that performs the actual Zod validation
 *
 * @param schema - Zod schema instance to validate against
 * @param data - Data to validate
 * @returns Validation result object with all error details
 *
 * @remarks
 * This function uses safeParse() to avoid throwing errors during validation.
 * It transforms Zod errors into a standardized format matching AJV output.
 */
export function validateSchemaUsingZod<T = unknown>(
  schema: ZodType<T>, // pass a z.* schema here
  data: unknown
) {
  // Safely extract the safeParse method from the schema
  // This provides a runtime safety check for schema validity
  const safeParse = (schema as any)?.safeParse;
  if (typeof safeParse !== "function") {
    throw new Error(
      "validateSchemaUsingZod: provided schema does not implement safeParse()"
    );
  }

  // Execute validation without throwing errors
  const result = safeParse.call(schema, data);

  // If validation passed, return success response with parsed data
  if (result && result.success) {
    return {
      valid: true,
      parsedData: result.data as T,
      errors: null,
      message: null,
    };
  }

  // Extract Zod validation issues and transform to standardized format
  const rawIssues = Array.isArray(result?.error?.issues)
    ? result.error.issues
    : [];

  /**
   * ValidationError structure matching AJV output
   * Ensures consistent error reporting across both validators
   */
  type ValidationError = {
    path: string[];
    message: string;
    expected: unknown | null;
    received: unknown | null;
  };

  // Transform Zod issues into our standardized error format
  const errors: ValidationError[] = rawIssues.map(
    (iss: any): ValidationError => {
      // Normalize the path to always be an array of strings
      const path = Array.isArray(iss.path)
        ? iss.path.map(String)
        : [String(iss.path)];

      // Extract the actual received value from the data using the error path
      // This traverses the data object to find what value was actually provided
      let received: unknown | null = null;
      if (path.length > 0) {
        received = data;
        for (const key of path) {
          received = (received as any)?.[key];
        }
      } else {
        // If no path, the error is at root level
        received = data;
      }

      return {
        path: path,
        message: String(iss.message ?? ""),
        // Zod provides the expected type/value in the 'expected' field
        expected: iss.expected === undefined ? null : iss.expected,
        // The actual received value from the data
        received: received === undefined ? null : received,
      };
    }
  );

  // Build a human-readable error message combining all validation errors
  const message =
    errors.length === 0
      ? "Unknown validation error"
      : errors
          .map((e: ValidationError) => {
            // Format path as dot-notation (e.g., "user.email")
            const p = e.path.length ? e.path.join(".") : "(root)";
            // Include expected value in message if available
            const ex = e.expected
              ? ` | expected: ${JSON.stringify(e.expected)}`
              : "";
            // Include received value in message if available
            const rc = e.received
              ? ` | received: ${JSON.stringify(e.received)}`
              : "";
            return `path: ${p} | message: ${e.message}${ex}${rc}`;
          })
          .join("\n");

  return {
    valid: false,
    parsedData: null as T | null,
    errors,
    message,
  };
}

/**
 * Validates data against a Zod schema and returns standardized validation result
 *
 * This is a wrapper around validateSchemaUsingZod() that provides a consistent
 * interface matching validateSchema() - both return { valid: boolean; errors: array }
 *
 * @param schema - Zod schema instance to validate against
 * @param data - Data to validate
 * @returns Object containing validation result (valid flag and errors array)
 *
 * @example
 * const result = assertSchema(zodUserSchema, responseBody);
 * if (result.valid) {
 *   console.log("Data matches schema");
 * } else {
 *   result.errors.forEach(err => {
 *     console.log(`${err.path.join('.')}: ${err.message}`);
 *   });
 * }
 */
export function assertSchema<T = unknown>(
  schema: ZodType<T>,
  data: unknown
): { valid: boolean; errors: any[] } {
  // Use the internal Zod validation function
  const res = validateSchemaUsingZod<T>(schema, data);

  // Return consistent structure: valid flag + errors array
  return {
    valid: res.valid,
    errors: res.errors || [],
  };
}
