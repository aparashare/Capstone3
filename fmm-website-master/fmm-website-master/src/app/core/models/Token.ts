export interface Token {
  access_token: string;
  refresh_token: string;
  grant_type: string;
  expires_in: number;
  token_type: string;
  scope: string;
}
