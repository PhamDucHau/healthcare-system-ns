import { describe, expect, it } from "vitest";
import { mapBookingError } from "@/lib/appointment-api";

describe("mapBookingError", () => {
  it("should tell the patient the profile is not approved", () => {
    expect(mapBookingError("PROFILE_UNVERIFIED")).toBe("Hồ sơ chưa được phê duyệt.");
  });
});
