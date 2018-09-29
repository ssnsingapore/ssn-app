import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { Project } from 'models/Project';

// eslint-disable-next-line no-unused-vars
import { ProjectOwner } from 'models/ProjectOwner';

// export const projectsRouterHome = express.Router();

// projectsRouterHome.get('/projects/home', asyncWrap(getProjectsHome));
// async function getProjectsHome(_req, res) {
//   const projects = await Project.find({}).limit(3).populate('projectOwner')
//     .exec();

//   return res
//     .status(200)
//     .json({ projects });
// }

// export const projectsRouterSearch = express.Router();

// projectsRouterSearch.get('/projects/search', asyncWrap(getProjectsSearch));
// async function getProjectsSearch(_req, res) {
//   const projects = await Project.find({}).populate('projectOwner')
//     .exec();

//   return res
//     .status(200)
//     .json({ projects });
// }

export const projectsRouterNumber = express.Router();

projectsRouterNumber.get('/projects', asyncWrap(getProjectsNumber));
async function getProjectsNumber(req, res) {
  // Params
  const numberOfProjects = Number(req.query.number);
  const projectType = req.query.type;

  // Dates
  const todaysDate = new Date();
  const yesterdaysDate = new Date(todaysDate - 24 * 60 * 60 * 1000);

  // Queries to mongodb
  let projects = {};
  if (projectType === "'past'") {
    projects = await Project.find(
      { endDate: { $lte: yesterdaysDate } },
    )
      .limit(numberOfProjects)
      .populate('projectOwner')
      .exec();
  } else if (projectType === "'present'") {
    console.log('present');
    projects = await Project.find(
      { endDate$: { $gte: todaysDate } }
    )
      .limit(numberOfProjects)
      .populate('projectOwner')
      .exec();
  } else {
    console.log('others');
    projects = await Project.find({})
      .limit(numberOfProjects)
      .populate('projectOwner')
      .exec();
  }

  return res.status(200).json({ projects });
}
