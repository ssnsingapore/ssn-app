export const Authenticator = jest.fn().mockImplementation(() => {
  return {
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn()
  }
})