export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message = "Resource conflict occurred") {
    super(message, 409);
  }
}

// 422 Unprocessable Entity (Great for validation failures)
export class ValidationError extends AppError {
  public errors?: Record<string, string[]>;

  constructor(message = "Validation failed", errors?: Record<string, string[]>) {
    super(message, 422);
    this.errors = errors;
  }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    // isOperational is false because programmatic errors shouldn't crash gracefully
    super(message, 500, false);
  }
}
// 409 Conflict: Thrown when trying to register an email already in use
export class UserAlreadyExistsError extends AppError {
  constructor(message = "A user with this email already exists") {
    super(message, 409);
  }
}

// 400 Bad Request: Thrown if database creation fails unexpectedly or input profile parameters are invalid
export class UserCreationFailedError extends AppError {
  constructor(message = "Failed to create user account. Please check your inputs") {
    super(message, 400);
  }
}

// 404 Not Found: Thrown when a targeted user operation fails because the user identifier does not exist
export class UserNotFoundError extends AppError {
  constructor(message = "The requested user account was not found") {
    super(message, 404);
  }
}

// 401 Unauthorized: Thrown when password checks or token assertions fail (kept generic for security)
export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password") {
    super(message, 401);
  }
}

// 403 Forbidden: Thrown when a user tries to access protected features before clicking their verification link
export class UserNotVerifiedError extends AppError {
  constructor(message = "Please verify your email address to access this feature") {
    super(message, 403);
  }
}

// 403 Forbidden: Thrown if a user tries to log into an account marked as 'isDelete: true'
export class UserAccountDeletedError extends AppError {
  constructor(message = "This user account has been deactivated or deleted") {
    super(message, 403);
  }
}

// 400 Bad Request: Thrown when an email verification link is broken, altered, or expired
export class InvalidVerificationTokenError extends AppError {
  constructor(message = "The verification token is invalid or has expired") {
    super(message, 400);
  }
}
