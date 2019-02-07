import uid from 'uid-safe';
import { config } from 'config/environment';
import { ProjectOwner } from 'models/ProjectOwner';
import { LoginService } from '../LoginService';
import { Admin } from '../../models/Admin';

jest.mock('uid-safe');
jest.mock('config/environment');

config.TOKEN_COOKIE_NAME = 'mockTokenCookieName';
config.TOKEN_COOKIE_MAXAGE = 60;

describe('Login service', () => {
  let loginService;
  const mockCsrfToken = '123';
  const mockJwt = 'header.payload.signature';

  describe('when logging in as a project owner', () => {
    let mockProjectOwner;

    beforeEach(() => {
      mockProjectOwner = new ProjectOwner({
        name: 'test',
        email: 'test@example.com',
      });
      mockProjectOwner.generateJwt = jest.fn(() => mockJwt);
      uid.mockResolvedValue(mockCsrfToken);
      loginService = new LoginService(mockProjectOwner);
    });

    describe('generating jwt cookie and csrf token', () => {
      it('should return cookie arguments and csrfToken', async () => {
        const { cookieArguments, csrfToken } = await loginService.generateCookieAndCsrfToken();

        expect(mockProjectOwner.generateJwt).toHaveBeenCalledWith(mockCsrfToken);
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

  describe('when logging in as an admin', () => {
    let mockAdmin;

    beforeEach(() => {
      mockAdmin = new Admin({
        name: 'test',
        email: 'test@example.com',
      });
      mockAdmin.generateJwt = jest.fn(() => mockJwt);
      uid.mockResolvedValue(mockCsrfToken);
      loginService = new LoginService(mockAdmin);
    });

    describe('generating jwt cookie and csrf token', () => {
      it('should return cookie arguments and csrfToken', async () => {
        const { cookieArguments, csrfToken } = await loginService.generateCookieAndCsrfToken();

        expect(mockAdmin.generateJwt).toHaveBeenCalledWith(mockCsrfToken);
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
});
