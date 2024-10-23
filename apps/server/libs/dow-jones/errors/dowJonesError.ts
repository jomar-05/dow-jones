export enum DowJonesError {
  AUTHN_INVALID_CLIENT_ERROR = 'unauthorized_client',
  AUTHN_LOGIN_FAIL_CONNECTION_ERROR = '131252',
  AUTHN_INVALID_USER_ERROR = 'invalid_user_password',
  AUTHZ_ERROR = 'access_denied',
  AUTHZ_SCOPE_ERROR = 'missing_pib_scope',
}
