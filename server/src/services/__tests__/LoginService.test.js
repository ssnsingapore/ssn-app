import uid from 'uid-safe';
import { config } from 'config/environment';
import { User } from 'models/User';
import { LoginService } from '../LoginService';

jest.mock('uid-safe');
jest.mock('config/environment');

config.TOKEN_COOKIE_NAME = 'mockTokenCookieName';
config.TOKEN_COOKIE_MAXAGE = 60;

describe('Login service', () => {
  let loginService;
  let mockUser;
  const mockCsrfToken = '123';
  const mockJwt = 'header.payload.signature';

  beforeEach(() => {
    mockUser = new User({
      name: 'test',
      email: 'test@test.com',
    });
    mockUser.generateJwt = jest.fn(() => mockJwt);
    uid.mockResolvedValue(mockCsrfToken);
    loginService = new LoginService(mockUser);
  });

  describe('generating jwt cookie and csrf token', () => {
    it('should return cookie arguments and csrfToken', async () => {
      const { cookieArguments, csrfToken } = await loginService.generateCookieAndCsrfToken();

      expect(mockUser.generateJwt).toHaveBeenCalledWith(mockCsrfToken);
      expect(cookieArguments).toEqual([
        config.TOKEN_COOKIE_NAME,
        mockJwt,
        {
          httpOnly: true,
          secure: true,
          sameSite: true,
          maxAge: config.TOKEN_COOKIE_MAXAGE,
        },
      ]);
      expect(csrfToken).toEqual(mockCsrfToken);
    });
  });
});
