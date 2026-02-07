/**
 * Returns the value if it is a non-empty string and not the literal "undefined"
 * (e.g. from serialized query params). Otherwise returns undefined.
 */
export function optionalQueryParam(
  value: string | undefined
): string | undefined {
  if (!value || value === "undefined") {
    return undefined;
  }
  return value;
}
