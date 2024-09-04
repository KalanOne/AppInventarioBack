export type { AccessTokenPayload, AccessToken };

interface AccessTokenPayload {
  userId: string;
  email: string;
}

interface AccessToken {
  access_token: string;
}
