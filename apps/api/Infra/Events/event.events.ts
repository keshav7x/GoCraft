
export type EventMetadata = {
  eventId: string;
  aggregateId: string;
  aggregateVersion: number;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
};

export type DomainEvent<
  TType extends string,
  TPayload,
> = EventMetadata & {
  type: TType;
  payload: TPayload;
};


export type IdentityEvent =
  | DomainEvent<
      "identity.registered",
      {
        userId: string;
        email: string;
        passwordHash: string;
      }
    >
  | DomainEvent<
      "identity.email_verification_requested",
      {
        verificationId: string;
        expiresAt: string;
      }
    >
  | DomainEvent<
      "identity.email_verified",
      {
        verifiedAt: string;
      }
    >
  | DomainEvent<
      "identity.password_reset_requested",
      {
        resetId: string;
        expiresAt: string;
      }
    >
  | DomainEvent<
      "identity.password_changed",
      {
        passwordHash: string;
        changedAt: string;
      }
    >
  | DomainEvent<
      "identity.login_succeeded",
      {
        sessionId: string;
      }
    >
  | DomainEvent<
      "identity.session_revoked",
      {
        sessionId: string;
        reason: "logout" | "security" | "expired";
      }
    >
  | DomainEvent<
      "identity.account_disabled",
      {
        reason: string;
      }
    >;


export type ProfileEvent =
  | DomainEvent<
      "profile.created",
      {
        userId: string;
        username: string;
        displayName: string;
      }
    >
  | DomainEvent<
      "profile.updated",
      {
        displayName?: string;
        bio?: string;
        avatarUrl?: string;
      }
    >
  | DomainEvent<
      "profile.username_changed",
      {
        previousUsername: string;
        newUsername: string;
      }
    >;


export type LearningEvent =
  | DomainEvent<
      "learning.lesson_started",
      {
        lessonId: string;
        moduleId: string;
      }
    >
  | DomainEvent<
      "learning.lesson_checkpoint_reached",
      {
        lessonId: string;
        checkpointId: string;
      }
    >
  | DomainEvent<
      "learning.lesson_completed",
      {
        lessonId: string;
        moduleId: string;
        completionId: string;
      }
    >
  | DomainEvent<
      "learning.module_unlocked",
      {
        moduleId: string;
        reason: "prerequisite_completed" | "admin_granted";
      }
    >
  | DomainEvent<
      "learning.module_completed",
      {
        moduleId: string;
      }
    >;


export type GoCraftEvent =
  | IdentityEvent
  | ProfileEvent
  | LearningEvent

export type GoCraftEventType = GoCraftEvent["type"];
