export type CalendarEvent = {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    timeZone?: string;
};

const compactDate = (d: string) => d.replace("-", "");

const compactTime = (t: string) => {
    const [h, m, s = "00"] = t.split(":");
    return `${h.padStart(2, "0")}${m.padStart(2, "0")}${s.padStart(2, "0")}`;
}

const stamp = (date: string, time: string) => `${compactDate(date)}T${compactTime(time)}`;

/** GOOGLE CALENDAR */
export function googleCalendarUrl(e: CalendarEvent): string {
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: e.title,
        dates: `${stamp(e.date, e.startTime)}/${stamp(e.date, e.endTime)}`,
    });

    if (e.description) params.set("details", e.description);
    if (e.location) params.set("location", e.location);
    if (e.timeZone) params.set("ctz", e.timeZone);

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}


/** .ics FILE */
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

function fold(line: string): string {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;

    const out: string[] = [];
    let current = "";
    let bytes = 0;
    for (const ch of line) {
        const b = enc.encode(ch).length;
        if (bytes + b > 75) {
            out.push(current);
            current = " " + ch;
            bytes = 1 + b;
        } else {
            current += ch;
            bytes += b;
        }
    }
    out.push(current);
    return out.join("\r\n");
}

export function buildIcs(e: CalendarEvent): string {
    const dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Khedemtak//Reservations//EN",
        "CALSCALE:GEORGIAN",
        "BEGIN:VEVENT",
        `UID:${e.id}@khedemtak.com`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${stamp(e.date, e.startTime)}`,
        `DTEND:${stamp(e.date, e.endTime)}`,
        `SUMMARY:${escapeText(e.title)}`,
        ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
        ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
        "END:VEVENT",
        "END:VCALENDAR",
    ];
    return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(e: CalendarEvent) {
    const blob = new Blob([buildIcs(e)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservation-${e.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}