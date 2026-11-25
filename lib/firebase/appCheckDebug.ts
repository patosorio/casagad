/** Local App Check debug is allowed only in development, and only when the flag is exactly "true". */
export function isAppCheckDebugEnabled(
  env: { NODE_ENV?: string; NEXT_PUBLIC_APPCHECK_DEBUG?: string } = process.env,
): boolean {
  return env.NODE_ENV === "development" && env.NEXT_PUBLIC_APPCHECK_DEBUG === "true";
}
