import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { Admin } from 'models/Admin';

export const adminsRouter = express.Router();

adminsRouter.get('/admins', asyncWrap(getAdmins));
async function getAdmins(_req, res) {
  const admins = await Admin.find({}).exec();
  return res
    .status(200)
    .json({ admins });
}
