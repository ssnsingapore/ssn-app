import express from 'express';

import { adminsRouter } from './admins_controller';
import { projectRouter } from './projects_controller';
import { projectOwnersRouter } from './project_owners_controller';

export const apiRouter = express.Router();

apiRouter.use(adminsRouter);
apiRouter.use(projectRouter);
apiRouter.use(projectOwnersRouter);
