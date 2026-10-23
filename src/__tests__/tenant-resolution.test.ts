import { describe, expect, it } from "vitest";
import { getTenantSlugByDomain } from "@/tenants/registry";
import { hostnameOf, resolveTenantSlug } from "../middleware";

describe("getTenantSlugByDomain", () => {
  it.each([
    ["addictstyle.com", "fashion"],
    ["www.addictstyle.com", "fashion"],
    ["dev.addictstyle.com", "fashion"],
    ["staging.addictstyle.com", "fashion"],
    ["DEV.AskMeBeauty.com", "beauty"],
    ["dev.digitfriend.com", "electronics"],
    ["pr-12.preview.digitfriend.com", "electronics"],
  ])("resolves %s to %s", (host, slug) => {
    expect(getTenantSlugByDomain(host)).toBe(slug);
  });

  it.each([
    "notaddictstyle.com",
    "addictstyle.com.evil.net",
    "example.com",
    "",
  ])("does not match %s", (host) => {
    expect(getTenantSlugByDomain(host)).toBeUndefined();
  });
});

describe("hostnameOf", () => {
  it.each([
    ["dev.digitfriend.com:5001", "dev.digitfriend.com"],
    ["127.0.0.1:5001", "127.0.0.1"],
    ["[::1]:5001", "::1"],
    ["Localhost", "localhost"],
  ])("strips the port from %s", (header, host) => {
    expect(hostnameOf(header)).toBe(host);
  });
});

describe("resolveTenantSlug", () => {
  const deployed = { isDevServer: false, headerSlug: null };

  it("prefers the domain over the header", () => {
    expect(
      resolveTenantSlug({
        host: "dev.digitfriend.com",
        headerSlug: "fashion",
        isDevServer: false,
      }),
    ).toBe("electronics");
  });

  it("uses a known x-tenant-slug header when the host matches nothing", () => {
    expect(
      resolveTenantSlug({
        host: "10.0.0.5",
        headerSlug: "Beauty",
        isDevServer: false,
      }),
    ).toBe("beauty");
  });

  it("ignores an unknown x-tenant-slug header", () => {
    expect(
      resolveTenantSlug({
        host: "10.0.0.5",
        headerSlug: "nope",
        isDevServer: false,
      }),
    ).toBeNull();
  });

  it("returns null (404) for an unknown host on a deployed build", () => {
    expect(
      resolveTenantSlug({ host: "dev.unknownshop.com", ...deployed }),
    ).toBeNull();
  });

  it.each(["localhost", "127.0.0.1", "::1"])(
    "falls back to fashion for loopback host %s (local + deploy health check)",
    (host) => {
      expect(resolveTenantSlug({ host, ...deployed })).toBe("fashion");
    },
  );

  it("falls back to fashion for any host under next dev", () => {
    expect(
      resolveTenantSlug({
        host: "192.168.100.9",
        headerSlug: null,
        isDevServer: true,
      }),
    ).toBe("fashion");
  });
});
