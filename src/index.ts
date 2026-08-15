/**
 * Host half of dsh-whale-picks-store: intentionally empty.
 * The store is a pure client-side settings section (reads the whale-picks
 * registry over HTTP); nothing needs the host process.
 */
/** Required services: none. */
export const inject = []

export function apply(_ctx: unknown): void {
  // no-op host half
}
