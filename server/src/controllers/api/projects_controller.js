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
  const projectType = req.query.type.toString();
  const numberOfProjects = Number(req.query.number);
  const earliestDate = new Date(1900, 0, 1);
  const todaysDate = new Date();
  const yesterdaysDate = todaysDate.getDate() - 1;
  const stopDate = new Date(2199, 0, 1);

  let projects = {};

  if (projectType === 'past') {
    projects = await Project.find(
      { endDate: { $gte: earliestDate, $lte: yesterdaysDate } },
      // { title: 1, endDate: 1, description: 1 }
    )
      .limit(numberOfProjects)
      .populate('projectOwner')
      .exec();
  } else if (projectType === 'present') {
    projects = await Project.find(
      { endDate$: { $gte: todaysDate, $lte: stopDate } },
      // { title: 1, endDate: 1, issuesAddressed: 1 }
    )
      .limit(numberOfProjects)
      .populate('projectOwner')
      .exec();
  } else {
    projects = await Project.find({}, )
      .limit(numberOfProjects)
      .populate('projectOwner')
      .exec();
  }

  return res.status(200).json({ projects });
}
