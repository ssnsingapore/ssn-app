import uid from 'uid-safe';
import { config } from 'config/environment';

export class LoginService {
  constructor(user) {
    this.user = user;
  }

  generateCookieAndCsrfToken = async () => {
    const csrfToken = await this._generateCsrfToken();
    const jwt = this.user.generateJwt(csrfToken);

    return {
      cookieArguments: [
        config.TOKEN_COOKIE_NAME,
        jwt,
        {
          httpOnly: true,
          secure: true,
          sameSite: true,
          maxAge: config.TOKEN_COOKIE_MAXAGE,
        },
      ],
      csrfToken,
    };
  }

  _generateCsrfToken = async () => uid(18);
}
