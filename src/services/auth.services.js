import api from './api'

const ENDPOINT = '/api/v1/auth'

export const AuthService = {
  login: (payload) =>
    api
      .post(ENDPOINT + '/token', new URLSearchParams(payload), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-skip-refresh': '1',
        },
        withCredentials: true,
      })
      .then((r) => r.data),

  logout: () => api.post(ENDPOINT + '/logout', null, { withCredentials: true }),

  refreshToken: () =>
    api
      .post(ENDPOINT + '/refresh_token', null, {
        headers: { 'x-skip-refresh': '1' },
        withCredentials: true,
      })
      .then((r) => r.data),

  forgotPassword: (payload) =>
    api.post(ENDPOINT + '/forgot-password', payload).then((r) => r.data),

  resetPassword: (payload) =>
    api.post(ENDPOINT + '/reset-password', payload).then((r) => r.data),
}
