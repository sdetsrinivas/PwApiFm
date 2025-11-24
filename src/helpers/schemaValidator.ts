import Ajv from "ajv";
import { ZodType } from "zod";

// enable collecting all errors and verbose params so we can build a complete report
const ajv = new Ajv({ allErrors: true, verbose: true });

export function validateSchema(schema: any, data: any) {
  const validate: any = ajv.compile(schema);
  const valid = validate(data);

  const rawErrors: any[] = Array.isArray(validate.errors)
    ? validate.errors
    : [];

  type ValidationError = {
    path: string[];
    message: string;
    expected: unknown | null;
    received: unknown | null;
  };

  const errors: ValidationError[] = rawErrors.map((e: any) => {
    // AJV uses `instancePath` (json-pointer) in newer versions, `dataPath` in older ones
    const pointer: string = e.instancePath ?? e.dataPath ?? "";
    const path = pointer
      ? pointer.split("/").filter((s: string) => s.length > 0)
      : [];

    // try to infer an "expected" value when AJV provides it via params
    let expected: unknown | null = null;
    if (e.params) {
      if (e.params.allowedValues !== undefined)
        expected = e.params.allowedValues;
      else if (e.params.type !== undefined) expected = e.params.type;
      else if (e.params.format !== undefined) expected = e.params.format;
    }

    // Get the received value from the data
    let received: unknown | null = null;
    if (path.length > 0) {
      received = data;
      for (const key of path) {
        received = (received as any)?.[key];
      }
    } else {
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

export function validateSchemaUsingZod<T = unknown>(
  schema: ZodType<T>, // pass a z.* schema here
  data: unknown
) {
  // Use Zod's safeParse (runtime check still present for safety)
  const safeParse = (schema as any)?.safeParse;
  if (typeof safeParse !== "function") {
    throw new Error(
      "validateSchemaUsingZod: provided schema does not implement safeParse()"
    );
  }

  const result = safeParse.call(schema, data);

  if (result && result.success) {
    return {
      valid: true,
      parsedData: result.data as T,
      errors: null,
      message: null,
    };
  }

  // Map Zod issues to a plain serializable structure (avoid Zod types)
  const rawIssues = Array.isArray(result?.error?.issues)
    ? result.error.issues
    : [];

  type ValidationError = {
    path: string[];
    message: string;
    expected: unknown | null;
    received: unknown | null;
  };

  const errors: ValidationError[] = rawIssues.map(
    (iss: any): ValidationError => {
      const path = Array.isArray(iss.path)
        ? iss.path.map(String)
        : [String(iss.path)];

      // Get the received value from the data using the error path
      let received: unknown | null = null;
      if (path.length > 0) {
        received = data;
        for (const key of path) {
          received = (received as any)?.[key];
        }
      } else {
        received = data;
      }

      return {
        path: path,
        message: String(iss.message ?? ""),
        // some Zod versions include "expected"/"received" or "received" fields for type errors
        expected: iss.expected === undefined ? null : iss.expected,
        received: received === undefined ? null : received,
      };
    }
  );

  const message =
    errors.length === 0
      ? "Unknown validation error"
      : errors
          .map((e: ValidationError) => {
            const p = e.path.length ? e.path.join(".") : "(root)";
            const ex = e.expected
              ? ` | expected: ${JSON.stringify(e.expected)}`
              : "";
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

export function assertSchema<T = unknown>(
  schema: ZodType<T>,
  data: unknown
): { valid: boolean; errors: any[] } {
  const res = validateSchemaUsingZod<T>(schema, data);

  return {
    valid: res.valid,
    errors: res.errors || [],
  };
}
