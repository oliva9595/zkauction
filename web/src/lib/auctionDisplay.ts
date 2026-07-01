import type { AuctionData } from "./auctionClient";

export function formatAuctionValue(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object" && "tag" in value) {
    const tag = (value as { tag?: unknown }).tag;
    if (typeof tag === "string") return tag;
    return stringifyFallback(value);
  }
  if (typeof value === "object" && "toString" in value && typeof value.toString === "function") {
    return value.toString();
  }
  return stringifyFallback(value);
}

export function unwrapAuctionResult(value: unknown): AuctionData {
  if (
    value &&
    typeof value === "object" &&
    "unwrap" in value &&
    typeof (value as { unwrap?: unknown }).unwrap === "function"
  ) {
    return (value as { unwrap: () => AuctionData }).unwrap();
  }

  if (
    value &&
    typeof value === "object" &&
    "tag" in value &&
    (value as { tag?: unknown }).tag === "Ok" &&
    "values" in value
  ) {
    const values = (value as { values?: unknown }).values;
    if (Array.isArray(values) && values[0]) {
      return values[0] as AuctionData;
    }
  }

  return value as AuctionData;
}

function stringifyFallback(value: unknown): string {
  try {
    const json = JSON.stringify(value);
    if (json !== undefined) return json;
  } catch {
    // Fall through to String(value).
  }
  return String(value);
}
