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
  const compareSchema = schemaVl.validateSchema(
    schemas.allUserSchema,
    responseBody
  );
  expect(compareSchema.valid).toBe(true);
});

test("verify the get particular user fetches the respective user", async ({
  userService,
}) => {
  const response = await userService.getUser("1");
  // Print the resolved request URL from the API response
  console.log("Resolved request URL (userService):", response.url());
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  const compareSchema = schemaVl.validateSchema(
    schemas.singleUserSchema,
    responseBody
  );
  console.log(compareSchema);
  expect(compareSchema.valid).toBe(true);
});

//datadriven test for getting particular users
const userIds = ["2", "3", "4", "5"];
for (const id of userIds) {
  test(`verify the get particular user ${id} fetches the respective user`, async ({
    userService,
  }) => {
    const response = await userService.getUser(id);
    // Print the resolved request URL from the API response
    console.log("Resolved request URL (userService):", response.url());
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(responseBody);
    const compareSchema = schemaVl.validateSchema(
      schemas.singleUserSchema,
      responseBody
    );
    console.log(compareSchema);
    expect(compareSchema.valid).toBe(true);
  });
}

test("verify the post reuest creates a new user", async ({ userService }) => {
  const response = await userService.createUser({
    id: 20,
    userName: "new user",
    password: "password",
  });
  // Print the resolved request URL from the API response
  console.log("Resolved request URL (userService):", response.url());
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  const compareSchema = schemaVl.validateSchema(
    schemas.singleUserSchema,
    responseBody
  );
  console.log(compareSchema);
  expect(compareSchema.valid).toBe(true);
});
