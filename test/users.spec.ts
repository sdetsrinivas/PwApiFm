import { schemas } from "../src/data/schemas";
import { test, expect } from "../src/fixtures/api-fixtures";
import * as schemaVl from "../src/helpers/schemaValidator";
import { User } from "../src/modules/user";

let newUser = new User();

test("verify the get all user functioanlity using get request", async ({
  userService,
}) => {
  const response = await userService.getAllUser();
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
  console.log("Resolved request URL (userService):", response.url());
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  const compareSchema = schemaVl.validateSchema(
    schemas.singleUserSchema,
    responseBody
  );
  console.log(JSON.stringify(compareSchema, null, 2));
  expect(compareSchema.valid).toBe(true);
});

//datadriven test for getting particular users
const userIds = ["2", "3", "4", "5"];
for (const id of userIds) {
  test(`verify the get particular user ${id} fetches the respective user`, async ({
    userService,
  }) => {
    const response = await userService.getUser(id);
    console.log("Resolved request URL (userService):", response.url());
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(responseBody);
    const compareSchema = schemaVl.validateSchema(
      schemas.singleUserSchema,
      responseBody
    );
    console.log(JSON.stringify(compareSchema, null, 2));
    expect(compareSchema.valid).toBe(true);
  });
}

test("verify the post request creates a new user", async ({ userService }) => {
  const response = await userService.createUser({
    id: 20,
    userName: "new user",
    password: "password",
  });
  console.log("Resolved request URL (userService):", response.url());
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  const compareSchema = schemaVl.validateSchema(
    schemas.singleUserSchema,
    responseBody
  );
  console.log(JSON.stringify(compareSchema, null, 2));
  expect(compareSchema.valid).toBe(true);
});

test("verify the post request creates a new user using random data", async ({
  userService,
}) => {
  const response = await userService.createUser(newUser);
  console.log("Resolved request URL (userService):", response.url());
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  const compareSchema = schemaVl.validateSchema(
    schemas.singleUserSchema,
    responseBody
  );
  expect(responseBody.userName).toBe(newUser.userName);
  expect(responseBody.id).toBe(newUser.id);
  expect(responseBody.password).toBe(newUser.password);
  console.log(JSON.stringify(compareSchema, null, 2));
  expect(compareSchema.valid).toBe(true);
});

test("verify the post request creates a new user and valdiate the schema using zod", async ({
  userService,
}) => {
  const response = await userService.createUser({
    id: 21,
    userName: "new user",
    password: "password",
  });
  console.log("Resolved request URL (userService):", response.url());
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log(responseBody);
  const compareSchema = schemaVl.assertSchema(
    schemas.zodSingleUserSchema,
    responseBody
  );
  console.log(JSON.stringify(compareSchema, null, 2));
  expect(compareSchema.valid).toBe(true);
});
