import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.OAUTH_USER_EMAIL,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});

mailer.verify((error, success) => {
  if (error) {
    console.log('Nodemailer to connect to SMTP server', error);
  }

  if (success) {
    console.log('Nodemailer successfully connected to SMTP server');
  }
});
