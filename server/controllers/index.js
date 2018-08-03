import express from 'express';

import { pagesRouter } from './pages_controller';
import { apiRouter } from './api';

export const router = express.Router();

router.use(pagesRouter);
router.use('/api/v1', apiRouter);
