import { getReservationAvailability, validateWhatsappPhone } from "@/lib/utils";
import { expect, describe, it, afterEach, vi } from "vitest";
import { getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import { ReservationList } from "@/contexts/ReservationsContext";

describe("validateWhatsappPhone", () => {
  describe("empty input", () => {
    it("rejects an empty string", () => {
      expect(validateWhatsappPhone("")).toEqual({
        valid: false,
        message: "Phone number is required",
      });
    });
  });

  describe("invalid input", () => {
    it.each([
      ["letters", "not a number"],
      ["whitespace only", "  "],
      ["too short", "+31"],
      ["too short with digits", "+3161"],
      ["too long", "+3161234567890123456"],
      ["no plus and no country", "0612345678"],
    ])("rejects %s", (_label, input) => {
      expect(validateWhatsappPhone(input)).toEqual({
        valid: false,
        message: "Invalid phone number",
      });
    });
  });

  describe("valid input", () => {
    it("accepts a US number and returns E.164 an country", () => {
      const result = validateWhatsappPhone("+1 213 373 4253");
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe("+12133734253");
      expect(result.country).toBe("US");
    });

    it("strips spaces, dashes and brackets", () => {
      const result = validateWhatsappPhone("+1 (213) 373-4253");
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe("+12133734253");
    });

    it.each(["NL", "TL", "GB", "AE"] as const)(
      "accepts a valid mobile example number %s",
      (country) => {
        const example = getExampleNumber(country, examples);
        const result = validateWhatsappPhone(example.number);

        expect(result.valid).toBe(true);
        expect(result.formatted).toBe(example.number);
        expect(result.country).toBe(country);
      },
    );
  });
});

describe("getReservationAvailability", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const createReservation = (
    overrides: Partial<ReservationList> = {},
  ): ReservationList => ({
    id: "reservation-1",
    date: "2026-11-11",
    created_at: null,
    client_id: "client-1",
    provider_id: "provider-1",
    service_id: "service-1",
    status: "accepted",
    provider_seen: false,
    client_seen: false,
    start_time: "10:00:00",
    end_time: "11:00:00",
    service: {
      title: "Haircut",
      is_online: false,
      location: "Amsterdam",
    },
    ...overrides,
  });

  it("should prevent reserving when a pending reservation exists", () => {
    const pendingReservation = createReservation({
      status: "pending",
    });

    const res = getReservationAvailability([pendingReservation]);

    expect(res).toEqual({
      canReserve: false,
      reason: "pending_reservation_exists",
      reservation: pendingReservation,
    });
  });

  it("should prevent reserving when an accepted reservation is still active", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-11T09:00:00"));

    const activeReservation = createReservation({
      status: "accepted",
      date: "2026-11-11",
      start_time: "10:00:00",
      end_time: "11:00:00",
    });

    const res = getReservationAvailability([activeReservation]);

    expect(res).toEqual({
      canReserve: false,
      reason: "active_reservation",
      reservation: activeReservation,
    });
  });

  it("should allow reserving when the accepted reservation has expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-11T12:00:00"));

    const expiredReservation = createReservation({
      status: "accepted",
      date: "2026-11-11",
      start_time: "10:00:00",
      end_time: "11:00:00",
    });

    const res = getReservationAvailability([expiredReservation]);

    expect(res).toEqual({
      canReserve: true,
      reason: null,
      reservation: null,
    });
  });

  it("should allow reserving when there are no reservations", () => {
    const res = getReservationAvailability([]);

    expect(res).toEqual({
      canReserve: true,
      reason: null,
      reservation: null,
    });
  });

  it("should prioritize pending reservations over accepted reservations", () => {
    const pendingReservation = createReservation({
      id: "pending-1",
      status: "pending",
    });

    const activeReservation = createReservation({
      id: "accepted-1",
      status: "accepted",
      end_time: "23:00:00",
    });

    const res = getReservationAvailability([
      activeReservation,
      pendingReservation,
    ]);

    expect(res).toEqual({
      canReserve: false,
      reason: "pending_reservation_exists",
      reservation: pendingReservation,
    });
  });

  it("should ignore accepted reservations without a date", () => {
    const reservationWithoutDate = createReservation({
      status: "accepted",
      date: null,
    });

    const res = getReservationAvailability([reservationWithoutDate]);

    expect(res).toEqual({
      canReserve: true,
      reason: null,
      reservation: null,
    });
  });

  it("should check the latest accepted reservation when multiple exist", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-11T12:00:00"));

    const olderReservation = createReservation({
      id: "older",
      date: "2026-11-10",
      start_time: "10:00:00",
      end_time: "11:00:00",
    });

    const latestReservation = createReservation({
      id: "latest",
      date: "2026-11-11",
      start_time: "13:00:00",
      end_time: "14:00:00",
    });

    const result = getReservationAvailability([
      latestReservation,
      olderReservation,
    ]);

    expect(result).toEqual({
      canReserve: false,
      reason: "active_reservation",
      reservation: latestReservation,
    });
  });
});
