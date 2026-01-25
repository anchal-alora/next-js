const IST_TIMEZONE = "Asia/Kolkata";

export function formatIstDateLong(input?: string | null): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  return d.toLocaleDateString("en-US", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
