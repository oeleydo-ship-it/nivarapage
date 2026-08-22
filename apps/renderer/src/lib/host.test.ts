import { describe, expect, it } from "vitest";
import {
  isLocalHost,
  isValidHost,
  normalizeHost,
  publicOrigin,
  requestHost,
  requestPath,
} from "./host";

describe("renderer host helpers", () => {
  it("normalizes forwarded and decorated hosts", () => {
    expect(normalizeHost("WWW.Example.COM:443")).toBe("www.example.com");
    expect(normalizeHost("https://www.example.com/path")).toBe("www.example.com");
    expect(normalizeHost("a.example.com, b.example.com")).toBe("a.example.com");
  });

  it("rejects junk hosts", () => {
    expect(isValidHost("not a host")).toBe(false);
    expect(isValidHost("www.example.com")).toBe(true);
    expect(isValidHost("")).toBe(false);
  });

  it("prefers Host unless the request is on the Cloudflare fallback origin", () => {
    const headers = new Headers({
      host: "fallback.uidesired.test",
      "x-forwarded-host": "www.customer.com",
    });
    process.env.CLOUDFLARE_FALLBACK_ORIGIN = "fallback.uidesired.test";
    expect(requestHost(headers)).toBe("www.customer.com");

    const direct = new Headers({
      host: "www.customer.com",
      "x-forwarded-host": "evil.example",
    });
    expect(requestHost(direct)).toBe("www.customer.com");
  });

  it("builds local origins and paths", () => {
    expect(isLocalHost("studio.localhost")).toBe(true);
    expect(publicOrigin("studio.localhost")).toBe("http://studio.localhost");
    expect(requestPath()).toBe("/");
    expect(requestPath(["about", "team"])).toBe("/about/team");
  });
});
