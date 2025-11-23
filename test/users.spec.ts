// tests/api/user.spec.ts
import { schemas } from "../src/data/schemas";
import { test, expect } from "../src/fixtures/api-fixtures";
import * as schemaVl from "../src/helpers/schemaValidator";

test("verify the get all user functioanlity using get request", async ({
  userService,
}) => {
  const response = await userService.getAllUser();
  // Print the resolved request URL from the API response
  console.log("Resolved request URL (userService):", response.url());
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  //validate the schema
  //   const userSchema = {
  //     type: "array",
  //     items: {
  //       type: "object",
  //       properties: {
  //         id: { type: "integer" },
  //         userName: { type: "string" },
  //         password: { type: "string" },
  //       },
  //       required: ["id", "userName", "password"],
  //     },
  //   };
  const isValid = schemaVl.validateSchema(schemas.allUserSchema, responseBody);
  expect(isValid.valid).toBe(true);
});
