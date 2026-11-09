export function formatMoney(
  cents: number,
  symbol = "$",
  currency = "USD",
): string {
  const amount = cents / 100;
  try {
    // Fixed locale: the same value must render identically on the server and
    // during client hydration, regardless of the visitor's OS language.
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
    }).format(amount);
  } catch {
    return `${symbol}${amount.toFixed(2)}`;
  }
}

export function savingsLabel(
  priceCents: number,
  compareAtCents: number | null,
  symbol = "$",
  currency = "USD",
): string | null {
  if (compareAtCents === null || compareAtCents <= priceCents) return null;
  return `Save ${formatMoney(compareAtCents - priceCents, symbol, currency)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function orderNumberFromId(id: string): string {
  return `KS-${id.slice(0, 8).toUpperCase()}`;
}

// Fixed locale + UTC so dates render identically on the server and during
// client hydration (locale- or timezone-dependent formatting causes
// hydration mismatches).
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
