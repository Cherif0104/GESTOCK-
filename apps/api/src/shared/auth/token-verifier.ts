export type JwtClaims = {
  sub?: string;
  email?: string;
  tid?: string;
  roles?: string[];
};

export interface TokenVerifier {
  verify(rawToken: string): Promise<JwtClaims>;
}

const decodePayload = (rawToken: string): JwtClaims => {
  const [, payload] = rawToken.split(".");
  if (!payload) {
    throw new Error("Malformed JWT token.");
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = Buffer.from(normalized, "base64").toString("utf8");
  const parsed = JSON.parse(decoded) as JwtClaims;

  return parsed;
};

export class UnsafeJwtPassthroughVerifier implements TokenVerifier {
  async verify(rawToken: string): Promise<JwtClaims> {
    return decodePayload(rawToken);
  }
}
