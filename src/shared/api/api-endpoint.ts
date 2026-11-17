/** Every backend route the frontend calls; mirrors the routes in backend/src/modules. */
export const API_ENDPOINT = {
  site: '/api/site',
  siteIcon: '/api/site-icon',
  diagram: '/api/diagram',
  authLogin: '/api/auth/login',
  authSession: '/api/auth/session',
} as const;
