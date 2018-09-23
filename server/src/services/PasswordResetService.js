import uid from 'uid-safe';

import { User } from 'models/User';
import { BadRequestErrorView } from 'util/errors';
import { mailer } from 'config/mailer';
import { config, isProduction } from 'config/environment';

export class PasswordResetService {
  trigger = async (email) => {
    const user = await this._findUser(email);
    const errorsObject = this._checkUserExists(user);
    if (!errorsObject) {
      await this._sendPasswordResetEmail(user);
    }

    return errorsObject;
  }

  getRedirectUrlAndSuccessFlag = async (userId, passwordResetToken) => {
    const user = await User.findById(userId);

    let message;
    let isSuccess = false;
    if (!user || user.passwordResetToken !== passwordResetToken) {
      message = 'It seems like there was something wrong with your password reset link. Please try again!';
    } else if (user.passwordResetExpiresAt < new Date()) {
      message = 'It seems like your password reset link has already expired. Please try to generate a new one.';
    } else {
      message = 'Please reset your password. Your session will expire in 10 minutes';
      isSuccess = true;
    }

    const alertType = isSuccess ? 'SUCCESS' : 'ERROR';
    const redirectPath = isSuccess ? 'passwordReset' : 'login';
    return {
      redirectUrl: `${config.WEBSITE_BASE_URL}/${redirectPath}#type=${alertType}&message=${encodeURIComponent(message)}`,
      isSuccess,
    };
  }

  getPasswordResetCookieArgs = async (isSuccess) => {
    const sharedOptions = {
      secure: isProduction,
      sameSite: true,
      maxAge: 10 * 60 * 1000,
    };

    const messageCookieArgs = [
      config.MESSAGE_COOKIE_NAME,
      config.MESSAGE_COOKIE_NAME,
      sharedOptions,
    ];

    if (isSuccess) {
      const csrf = await uid(18);
      return {
        message: messageCookieArgs,
        passwordResetToken: [
          config.PASSWORD_RESET_TOKEN_COOKIE_NAME,
          config.PASSWORD_RESET_TOKEN_COOKIE_NAME,
          {
            ...sharedOptions,
            httpOnly: true,
          },
        ],
        email: [
          config.PASSWORD_RESET_EMAIL_COOKIE_NAME,
          config.PASSWORD_RESET_EMAIL_COOKIE_NAME,
          {
            ...sharedOptions,
            httpOnly: true,
          },
        ],
        csrf: [
          config.PASSWORD_RESET_CSRF_COOKIE_NAME,
          csrf,
          sharedOptions,
        ],
      };
    }

    return {
      message: messageCookieArgs,
    };
  }

  _findUser = async email => User.findOne({ email })

  _checkUserExists = (user) => {
    if (!user) {
      return { errors: [new BadRequestErrorView('The given email couldn\'t be found in our system')] };
    }

    return null;
  }

  _sendPasswordResetEmail = async (user) => {
    try {
      const passwordResetToken = await user.generatePasswordResetToken();
      await user.resetToRandomPassword();
      const info = await mailer.sendMail({
        to: user.email,
        subject: 'SSN Project Portal Password Reset',
        html: this._passwordResetEmailHtml(user),
      });
      console.log(`Successfuly sent email with messageId: ${info.messageId} and passwordResetToken : ${passwordResetToken}`);
    } catch (error) {
      console.log('Failed to send email with error: ', error);
      throw error;
    }
  }

  _passwordResetEmailHtml = user => (`
    <p>Dear ${user.name}</p>

    <p>
      You have requested to reset your password on the SSN Project Portal.
      <br />
      Please click the link below to reset your password. This link will expire in 1 hour:
    </p>

    <a href="${this._passwordResetUrl(user)}">Reset your password</a>

    <p><em>SSN</em></p>
  `)

  _passwordResetUrl = user => encodeURI(`${config.API_BASE_URL}/api/v1/users/${user.id}/passwordReset/${user.passwordResetToken}`)

  testExports = {
    passwordResetEmailHtml: this._passwordResetEmailHtml,
  }
}
