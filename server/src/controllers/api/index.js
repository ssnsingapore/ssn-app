import express from 'express';

import { config } from 'config/environment';
import { adminsRouter } from './admins_controller';
import { projectRouter } from './projects_controller';
import { projectOwnersRouter } from './project_owners_controller';

export const apiRouter = express.Router();

apiRouter.get('/tracking_id', (_req, res) => res
  .status(200)
  .json({ trackingId: config.GOOGLE_ANALYTICS_TRACKING_ID }));

apiRouter.use(adminsRouter);
apiRouter.use(projectRouter);
apiRouter.use(projectOwnersRouter);
