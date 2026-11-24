import {
  buildIcs,
  CalendarEvent,
  downloadIcs,
  googleCalendarUrl,
} from "@/lib/calendarLinks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const baseEvent: CalendarEvent = {
  id: "res-123",
  title: "Plumbing visit",
  date: "2026-11-13",
  startTime: "14:00",
  endTime: "15:30",
};

const unfold = (ics: string) => ics.replace(/\r\n /g, "");
const byteLength = (s: string) => new TextEncoder().encode(s).length;

describe("googleCalendarUrl", () => {
  const parse = (e: CalendarEvent) => new URL(googleCalendarUrl(e));

  it("points at the Google Calendar render endpoint", () => {
    const url = parse(baseEvent);
    expect(url.origin + url.pathname).toBe(
      "https://calendar.google.com/calendar/render",
    );
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
  });

  it("omits optional parameters when they are not provided", () => {
    const url = parse(baseEvent);
    expect(url.searchParams.has("details")).toBe(false);
    expect(url.searchParams.has("location")).toBe(false);
    expect(url.searchParams.has("ctz")).toBe(false);
  });

  it("includes description, location and time zone when provided", () => {
    const url = parse({
      ...baseEvent,
      description: "Bring tools",
      location: "Main St 1",
      timeZone: "Asia/Jerusalem",
    });
    expect(url.searchParams.get("details")).toBe("Bring tools");
    expect(url.searchParams.get("location")).toBe("Main St 1");
    expect(url.searchParams.get("ctz")).toBe("Asia/Jerusalem");
  });

  it("round-trips special characters and Arabic text", () => {
    const title = "صيانة & تركيب: 50% off?";
    expect(parse({ ...baseEvent, title }).searchParams.get("text")).toBe(title);
  });

  it.each([
    ["14:00", "140000"],
    ["14:30:15", "143015"],
    ["9:05", "090500"],
  ])("normalize the time %s", (time, expected) => {
    const dates = parse({ ...baseEvent, startTime: time }).searchParams.get(
      "dates",
    )!;
    expect(dates.startsWith(`20261113T${expected}/`)).toBe(true);
  });
});

describe("buildIcs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-13T10:20:30.123Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses CRLF line endings and ends with a final CRLF", () => {
    const ics = buildIcs(baseEvent);
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(/(^|[^\r])\n/.test(ics)).toBe(false);
  });

  it("has the required calendar wrapper and headers", () => {
    const lines = buildIcs(baseEvent).split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("VERSION:2.0");
    expect(lines).toContain("CALSCALE:GREGORIAN");
    expect(lines).toContain("BEGIN:VEVENT");
    expect(lines).toContain("END:VEVENT");
    expect(lines).toContain("END:VCALENDAR");
  });

  it("writes UID, DTSAMP, DTSART, DTEND and SUMMARY", () => {
    const lines = buildIcs(baseEvent).split("\r\n");
    expect(lines).toContain("UID:res-123@khedemtak.com");
    expect(lines).toContain("DTSTAMP:20261113T102030Z");
    expect(lines).toContain("DTSTART:20261113T140000");
    expect(lines).toContain("DTEND:20261113T153000");
    expect(lines).toContain("SUMMARY:Plumbing visit");
  });

  it("omits DESCRIPTION and LOCATION when not provided", () => {
    const ics = buildIcs(baseEvent);
    expect(ics).not.toContain("DESCRIPTION:");
    expect(ics).not.toContain("LOCATION:");
  });

  it("includes DESCRIPTION and LOCATION when provided", () => {
    const lines = buildIcs({
      ...baseEvent,
      description: "Bring tools",
      location: "Main St 1",
    }).split("\r\n");
    expect(lines).toContain("DESCRIPTION:Bring tools");
    expect(lines).toContain("LOCATION:Main St 1");
  });

  it("escapes backlashes, semicolons, commas and newlines", () => {
    const ics = buildIcs({ ...baseEvent, description: "a,b;c\\d\ne" });
    expect(ics).toContain("DESCRIPTION:a\\,b\\;c\\\\d\\ne");
  });

  it("escapes Windows-style CRLF newlines too", () => {
    const ics = buildIcs({ ...baseEvent, description: "line1\r\nline2" });
    expect(ics).toContain("DESCRIPTION:line1\\nline2");
  });

  describe("line folding", () => {
    it("keeps every physical line within 75 bytes", () => {
      const ics = buildIcs({ ...baseEvent, description: "x".repeat(300) });
      for (const line of ics.split("\r\n")) {
        expect(byteLength(line)).toBeLessThanOrEqual(75);
      }
    });

    it("starts continuation lines with a space and unfolds to original text", () => {
      const description = "word ".repeat(60).trim();
      const ics = buildIcs({ ...baseEvent, description });
      const lines = ics.split("\r\n");
      const start = lines.findIndex((l) => l.startsWith("DESCRIPTION:"));
      expect(lines[start + 1].startsWith(" ")).toBe(true);
      expect(unfold(ics)).toContain(`DESCRIPTION:${description}`);
    });

    it("does not split multi-byte Arabic characters", () => {
      const description = "خدمة صيانة ".repeat(30).trim();
      const ics = buildIcs({ ...baseEvent, description });
      for (const line of ics.split("\r\n")) {
        expect(byteLength(line)).toBeLessThanOrEqual(75);
      }
      const unfolded = unfold(ics);
      expect(unfolded).toContain(`DESCRIPTION:${description}`);
      expect(unfolded).not.toContain("\uFFFD");
    });
  });
});

describe("downloadIcs", () => {
  let clickedAnchor: HTMLAnchorElement | null;
  let createObjectURL: ReturnType<typeof vi.spyOn>;
  let revokeObjectURL: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    clickedAnchor = null;

    createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake-url");
    revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      clickedAnchor = this;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("creates a calendar blob and clicks a download link with a sensible filename", async () => {
    downloadIcs(baseEvent);

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/calendar;charset=utf-8");
    expect(await blob.text()).toContain("SUMMARY:Plumbing visit");

    expect(clickedAnchor).not.toBeNull();
    expect(clickedAnchor!.download).toBe("reservation-res-123.ics");
    expect(clickedAnchor!.href).toBe("blob:fake-url");
  });

  it("removes the temporary link from the page", () => {
    downloadIcs(baseEvent);
    expect(document.body.contains(clickedAnchor)).toBe(false);
  });

  it("revokes the object URL after a delay", () => {
    downloadIcs(baseEvent);
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });
});