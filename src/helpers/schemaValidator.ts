import Ajv from "ajv";
import { ZodType } from "zod";
const ajv = new Ajv();

export function validateSchema(schema: any, data: any) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid, errors: validate.errors };
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
    code: string;
    expected: unknown | null;
    received: unknown | null;
    meta: any | null;
  };

  const errors: ValidationError[] = rawIssues.map(
    (iss: any): ValidationError => ({
      // `path` is typically an array of keys/indices
      path: Array.isArray(iss.path) ? iss.path.map(String) : [String(iss.path)],
      message: String(iss.message ?? ""),
      code: String(iss.code ?? ""),
      // some Zod versions include "expected"/"received" or "received" fields for type errors
      expected: iss.expected === undefined ? null : iss.expected,
      received: iss.received === undefined ? null : iss.received,
      // include any other useful raw props (safe to include; still plain JSON)
      meta: iss.meta ?? null,
    })
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
): T {
  const res = validateSchemaUsingZod<T>(schema, data);
  if (res.valid && res.parsedData !== null) return res.parsedData as T;

  // Throw an error with the pre-built message and JSON details for logs/reporters
  const details = {
    message: res.message,
    errors: res.errors,
  };

  throw new Error(
    `Schema validation failed:\n${res.message}\n\nDetails: ${JSON.stringify(
      details,
      null,
      2
    )}`
  );
}
