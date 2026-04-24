export class PaymentValidationError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'PaymentValidationError';
  }
}

export class ResourceNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}
