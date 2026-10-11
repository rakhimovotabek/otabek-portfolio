export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}
export const unavailable = () => new ApiError(503, "temporarily_unavailable");
