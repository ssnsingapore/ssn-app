import AWS from 'aws-sdk';

// =============================================================================
// S3 CONFIGURATION
// =============================================================================
AWS.config = new AWS.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

export const s3 = new AWS.S3();
