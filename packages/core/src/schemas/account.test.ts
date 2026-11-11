import { describe, expect, it } from "vitest";
import { accountSignupSchema } from "./account";

const valid = { name: "Sam", email: "sam@example.com", phone: "" };

describe("accountSignupSchema", () => {
  it("accepts a name and email with no phone", () => {
    expect(accountSignupSchema.parse(valid)).toEqual(valid);
  });

  it("trims and lowercases the email", () => {
    expect(accountSignupSchema.parse({ ...valid, email: "  Sam@Example.COM " }).email).toBe(
      "sam@example.com",
    );
  });

  it("accepts common phone formats", () => {
    for (const phone of ["(215) 555-0123", "+1 215 555 0123", "215.555.0123", "2155550123"]) {
      expect(accountSignupSchema.safeParse({ ...valid, phone }).success).toBe(true);
    }
  });

  it("rejects bad input", () => {
    expect(accountSignupSchema.safeParse({ ...valid, name: "  " }).success).toBe(false);
    expect(accountSignupSchema.safeParse({ ...valid, email: "sam@" }).success).toBe(false);
    expect(accountSignupSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(accountSignupSchema.safeParse({ ...valid, phone: "call me" }).success).toBe(false);
  });
});
