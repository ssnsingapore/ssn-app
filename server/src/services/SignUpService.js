import { s3 } from 'config/aws';
import { mailer } from 'config/mailer';
import { config } from 'config/environment';

export class SignUpService {
  constructor(user, password, userType, profilePhotoImage) {
    this.user = user;
    this.password = password;
    this.userType = userType;
    this.profilePhotoImage = profilePhotoImage;
  }

  execute = async () => {
    try {
      await this._saveUser();
      await this._uploadProfilePhotoAndSetUrl();
      await this._sendConfirmationEmail();
      return null;
    } catch (err) {
      await this.user.remove();
      if (err.name === 'ValidationError') {
        return {
          errors: err.message,
        };
      }
      throw err;
    }
  }

  _saveUser = async () => {
    await this.user.setPassword(this.password);

    try {
      await this.user.save();
    } catch (err) {
      throw err;
    }
  }

  _uploadProfilePhotoAndSetUrl = async () => {
    if (this.profilePhotoImage) {
      const response = await s3.upload({
        Body: this.profilePhotoImage.buffer,
        Key: `${new Date().getTime()}-${this.user.id}-${this.user.name}`,
        ACL: 'public-read',
        Bucket: `${config.AWS_BUCKET_NAME}/project_owner_profile_photos`,
      }).promise();
      this.user.set({ profilePhotoUrl: response.Location });
      await this.user.save();
    }
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

  _confirmationUrl = () => encodeURI(`${config.API_BASE_URL}/api/v1/${this.userType.toLowerCase()}s/${this.user.id}/confirmation/${this.user.confirmationToken}`)

  testExports = {
    confirmationEmailHtml: this._confirmationEmailHtml,
  }
}
