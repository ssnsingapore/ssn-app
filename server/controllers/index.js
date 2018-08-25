import express from 'express';

import { apiRouter } from './api';

export const router = express.Router();

router.use('/api/v1', apiRouter);
