import { User } from 'models/User';
import { BadRequestErrorView } from 'util/errors';
import { mailer } from 'config/mailer';
import { config } from 'config/environment';

export class PasswordResetService {
  constructor(email) {
    this.email = email;
  }

  trigger = async () => {
    const user = await this._findUser();
    const errorsObject = this._checkUserExists(user);
    if (!errorsObject) {
      await this._sendPasswordResetEmail(user);
    }

    return errorsObject;
  }

  _findUser = async () => User.findOne({ email: this.email })

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

  _passwordResetUrl = user => encodeURI(`${config.API_BASE_URL}/api/v1/users/${user.id}/passwordResetToken/${user.passwordResetToken}`)

  testExports = {
    passwordResetEmailHtml: this._passwordResetEmailHtml,
  }
}
