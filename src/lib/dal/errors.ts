// Thrown when an outing doesn't exist or doesn't belong to the acting user.
// The two cases are deliberately indistinguishable so callers can't probe
// for other users' outing ids.
export class OutingNotFoundError extends Error {
  constructor(outingId: number) {
    super(`Outing ${outingId} not found`);
    this.name = "OutingNotFoundError";
  }
}
