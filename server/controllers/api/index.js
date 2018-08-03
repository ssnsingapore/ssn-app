import express from 'express';

import { usersRouter } from './users_controller';
import { todosRouter } from './todos_controller';

export const apiRouter = express.Router();

apiRouter.use(usersRouter);
apiRouter.use(todosRouter);
