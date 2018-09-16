import { mailer } from 'config/mailer';
import { config } from 'config/environment';
import { UnprocessableEntityErrorView } from 'util/errors';

export class SignUpService {
  constructor(user, password) {
    this.user = user;
    this.password = password;
  }

  execute = async () => {
    const errorsObject = await this._saveUser();
    if (!errorsObject) {
      await this._sendConfirmationEmail();
    }

    return errorsObject;
  }

  _saveUser = async () => {
    await this.user.setPassword(this.password);

    try {
      await this.user.save();
    } catch (err) {
      return this._checkForDuplicateEmail(err);
    }

    return null;
  }

  _checkForDuplicateEmail = (err) => {
    if (err.name === 'ValidationError'
      && err.errors.email.message === 'should be unique') {
      return {
        errors: [
          new UnprocessableEntityErrorView(
            'Email is taken',
            'The email address you have entered is already associated with another account',
          ),
        ],
      };
    }

    throw err;
  }

  _sendConfirmationEmail = async () => {
    try {
      const confirmationToken = await this.user.generateConfirmationToken();
      const info = await mailer.sendMail({
        to: this.user.email,
        subject: 'SSN Project Portal Sign Up Confirmation',
        html: this._confirmationEmailHtml(),
      });
      console.log(`Successfuly sent email with messageId: ${info.messageId} and confirmationToken: ${confirmationToken}`);
    } catch (error) {
      console.log('Failed to send email with error: ', error);
      throw error;
    }
  }

  _confirmationEmailHtml = () => (`
    <p>Dear ${this.user.name}</p>

    <p>
      Thank you for signing up on the SSN Project Portal!
      <br />
      Please click the confirmation link below to activate your account:
    </p>

    <a href="${this._confirmationUrl()}">Activate your account</a>

    <p><em>SSN</em></p>
  `)

  _confirmationUrl = () => encodeURI(`${config.API_BASE_URL}/api/v1/users/${this.user.id}/confirmation/${this.user.confirmationToken}`)

  testExports = {
    confirmationEmailHtml: this._confirmationEmailHtml,
  }
}
