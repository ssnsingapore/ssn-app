import express from 'express';
import multer from 'multer';

import { s3, config } from 'config';
import { Image } from 'models/Image';
import { asyncWrap } from 'util/async_wrapper';

export const imagesRouter = express.Router();
const upload = multer();

imagesRouter.post('/images', upload.single('image'), asyncWrap(uploadImage));
async function uploadImage(req, res) {
  const { file } = req;

  // We use upload instead of putObject so that we can access the public URL
  // See https://stackoverflow.com/questions/30763448/node-js-aws-s3-file-upload-how-to-get-public-url-response
  // Unfortunately there is no promise-based implementation for upload
  // and we will have to use a callback
  const response = await s3.upload({
    Body: file.buffer,
    Key: `${new Date().getTime()}-${file.originalname}`,
    ACL: 'public-read',
    Bucket: config.AWS_BUCKET_NAME,
  }).promise();

  const image = new Image({ imageUrl: response.Location });
  await image.save();

  return res
    .status(200)
    .json({ image: image.toJSON() });
}
