import express from 'express';

import { usersRouter } from './users_controller';
import { todosRouter } from './todos_controller';
import { imagesRouter } from './images_controller';
import { projectsRouter } from './projects_controller';

export const apiRouter = express.Router();

apiRouter.use(usersRouter);
apiRouter.use(imagesRouter);
apiRouter.use(todosRouter);
apiRouter.use(projectsRouter);
