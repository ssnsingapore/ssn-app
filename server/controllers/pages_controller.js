import express from 'express';

export const pagesRouter = express.Router();

pagesRouter.get('/', getHome);
function getHome(req, res) {
  res.render('index', { title: 'Express' });
}
