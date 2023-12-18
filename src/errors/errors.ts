export class UnprocessableEntityError extends Error {}

export class UnauthorizedError extends Error {
  constructor() {
    super();
    this.message = "Unauthorized";
  }
}

export class ProviderIntegrationError extends Error {
  constructor(name = "General") {
    super();
    this.name = "IntegrationError";
    this.message = `${name} Integration Error`;
  }
}
