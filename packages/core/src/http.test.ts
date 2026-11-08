import { describe, expect, it } from "vitest";
import { parseBearerToken } from "./http";

describe("parseBearerToken", () => {
  it("reads a bearer token", () => {
    expect(parseBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(parseBearerToken("bearer   abc ")).toBe("abc");
  });

  it("ignores missing or other auth schemes", () => {
    expect(parseBearerToken(null)).toBeNull();
    expect(parseBearerToken(undefined)).toBeNull();
    expect(parseBearerToken("")).toBeNull();
    expect(parseBearerToken("Bearer")).toBeNull();
    expect(parseBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
    expect(parseBearerToken("Bearer two tokens")).toBeNull();
  });
});
