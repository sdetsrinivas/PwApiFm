import { z } from "zod";

export class schemas {
  static allUserSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "integer" },
        userName: { type: "string" },
        password: { type: "string" },
      },
      required: ["id", "userName", "password"],
    },
  };

  static singleUserSchema = {
    type: "object",
    properties: {
      id: {
        type: "number",
      },
      userName: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
    required: ["id", "userName", "password"],
  };

  static zodSingleUserSchema = z.object({
    id: z.number(),
    userName: z.string(),
    password: z.string(),
  });
}
