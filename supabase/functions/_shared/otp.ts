const secret = Deno.env.get("OTP_HMAC_SECRET")!;

const keyPromise = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
);

export async function hashOtp(phone: string, otp: string): Promise<string> {
    const key = await keyPromise;
    const sig = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(`${phone}:${otp}`),
    );
    return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}