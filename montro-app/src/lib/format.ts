export function gbp(n: number | null | undefined, currency = "GBP"): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "–";
  const symbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "AED ", CHF: "CHF ", HKD: "HK$", JPY: "¥" };
  const sym = symbols[currency] ?? "";
  return sym + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function num(n: number | null | undefined, dp = 0): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "–";
  return Number(n).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function pct(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "–";
  return (Number(n) * 100).toFixed(1) + "%";
}

export function ukDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
}

// Next sequential Stock ID for a category prefix, e.g. WAT-0007
export function nextStockId(prefix: string, existing: string[]): string {
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  let max = 0;
  for (const s of existing) {
    const m = re.exec(s || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

export function nextSeq(prefix: string, existing: string[]): string {
  return nextStockId(prefix, existing);
}
