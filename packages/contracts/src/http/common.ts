import { Static, Type } from "@sinclair/typebox";

export const IsoDateStringSchema = Type.String({
  format: "date-time",
  description: "Date ISO-8601 UTC."
});

export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  statusCode: Type.Integer()
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

export const HealthResponseSchema = Type.Object({
  status: Type.Literal("ok"),
  service: Type.String(),
  timestamp: IsoDateStringSchema
});

export type HealthResponse = Static<typeof HealthResponseSchema>;

export const ReadyResponseSchema = Type.Object({
  status: Type.Union([Type.Literal("ready"), Type.Literal("degraded")]),
  checks: Type.Object({
    database: Type.Boolean(),
    tenantContext: Type.Boolean()
  }),
  timestamp: IsoDateStringSchema
});

export type ReadyResponse = Static<typeof ReadyResponseSchema>;
