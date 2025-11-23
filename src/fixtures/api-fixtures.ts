import { test as base, request as playwrightRequest } from "@playwright/test";
import { UsersService } from "../services/userService";

type ApiFixtures = {
  apiRequest: import("@playwright/test").APIRequestContext;
  userService: UsersService;
};

export const test = base.extend<ApiFixtures>({
  apiRequest: async ({}, use) => {
    const apiRequest = await playwrightRequest.newContext({
      baseURL: "https://fakerestapi.azurewebsites.net",
      extraHTTPHeaders: {
        "Content-Type": "application/json",
      },
    });
    await use(apiRequest);
    await apiRequest.dispose();
  },

  userService: async ({ apiRequest }, use) => {
    await use(new UsersService(apiRequest, "api/v1"));
  },
});

export const expect = test.expect;
