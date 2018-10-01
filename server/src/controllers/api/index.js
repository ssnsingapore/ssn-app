import express from 'express';

import { adminsRouter } from './admins_controller';
import { usersRouter } from './users_controller';
import { todosRouter } from './todos_controller';
import { imagesRouter } from './images_controller';
import { projectsRouterNumber, projectRouter } from './projects_controller';
import { projectOwnersRouter } from './project_owners_controller';

export const apiRouter = express.Router();

apiRouter.use(adminsRouter);
apiRouter.use(usersRouter);
apiRouter.use(imagesRouter);
apiRouter.use(todosRouter);
// apiRouter.use(projectsRouterHome);
// apiRouter.use(projectsRouterSearch);
apiRouter.use(projectsRouterNumber);
apiRouter.use(projectRouter);
apiRouter.use(projectOwnersRouter);
