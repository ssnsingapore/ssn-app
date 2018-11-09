import express from 'express';
import multer from 'multer';

import { asyncWrap } from 'util/async_wrapper';
import { Project, ProjectState } from 'models/Project';
// eslint-disable-next-line no-unused-vars
import { ProjectOwner } from 'models/ProjectOwner';
import { Role } from 'models/Role';
import { UnprocessableEntityErrorView } from 'util/errors';
import {
  ProjectOwnerAllowedTransitions,
  AdminAllowedTransitions,
} from 'config/stateChangePermissions';
import { s3 } from 'config/aws';
import { config } from 'config/environment';
import { authMiddleware } from 'util/auth';

export const projectRouter = express.Router();

projectRouter.get('/projects', asyncWrap(getProjects));
async function getProjects(req, res) {
  const pageSize = Number(req.query.pageSize) || 10;
  const {
    projectState = ProjectState.APPROVED_ACTIVE,
    issueAddressed,
    projectLocation,
  } = req.query;

  const sortParams = projectState === ProjectState.PENDING_APPROVAL
    ? { createdAt: 'ascending' }
    : { updatedAt: 'descending' };

  const filterParams = {
    ...(issueAddressed && { issuesAddressed: issueAddressed }),
    ...(projectLocation && { location: projectLocation }),
  };

  // Queries to mongodb
  const projects = await Project.find({
    state: projectState,
    ...filterParams,
  })
    .limit(pageSize)
    .populate('projectOwner')
    .sort(sortParams)
    .exec();

  return res.status(200).json({ projects });
}

projectRouter.get('/project_counts', asyncWrap(getProjectCounts));
async function getProjectCounts(req, res) {
  const { issueAddressed, projectLocation } = req.query;
  const counts = {};
  const projectStates = Object.keys(ProjectState);

  const filterParams = {
    ...(issueAddressed && { issuesAddressed: issueAddressed }),
    ...(projectLocation && { location: projectLocation }),
  };

  for (let i = 0; i < projectStates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    counts[projectStates[i]] = await Project.count({
      state: projectStates[i],
      ...filterParams,
    });
  }

  return res.status(200).json({ counts });
}

projectRouter.get('/projects/:id', asyncWrap(getProject));
async function getProject(req, res) {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate('projectOwner')
    .exec();

  return res.status(200).json({ project });
}

// =============================================================================
// Project Owner Routes
// =============================================================================
projectRouter.get(
  '/project_owner/projects',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  asyncWrap(getProjectsForProjectOwner)
);
async function getProjectsForProjectOwner(req, res) {
  const { user } = req;
  const pageSize = Number(req.query.pageSize) || 10;
  const { projectState = ProjectState.APPROVED_ACTIVE } = req.query;
  const projects = await Project.find({
    state: projectState,
    projectOwner: user.id,
  })
    .limit(pageSize)
    .populate('projectOwner')
    .sort({ updatedAt: 'descending' })
    .exec();

  return res.status(200).json({ projects });
}

projectRouter.get(
  '/project_owner/project_counts',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  asyncWrap(getProjectCountsForProjectOwner)
);
async function getProjectCountsForProjectOwner(req, res) {
  const counts = {};
  const projectStates = Object.keys(ProjectState);
  const { user } = req;
  for (let i = 0; i < projectStates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    counts[projectStates[i]] = await Project.count({
      state: projectStates[i],
      projectOwner: user.id,
    });
  }

  return res.status(200).json({ counts });
}


const fieldsToParseJson = ['volunteerRequirements', 'issuesAddressed'];
const upload = multer();

projectRouter.post(
  '/project_owner/projects/new',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  upload.single('projectImage'),
  asyncWrap(postProject)
);

async function postProject(req, res) {
  const { file, body } = req;

  Object.keys(body)
    .filter(key => fieldsToParseJson.includes(key))
    .forEach((key) => {
      body[key] = JSON.parse(body[key]);
    });

  const project = new Project({
    ...body,
    state: ProjectState.PENDING_APPROVAL,
  });

  const uploadProjectImageAndSetUrl = async () => {
    if (file) {
      const response = await s3
        .upload({
          Body: file.buffer,
          Key: `${new Date().getTime()}-${project.id}-${project.title}`,
          ACL: 'public-read',
          Bucket: `${config.AWS_BUCKET_NAME}/project_cover_images`,
        })
        .promise();
      project.set({ coverImageUrl: response.Location });
      await project.save();
    }
  };

  await project.save();
  await uploadProjectImageAndSetUrl();
  return res.status(201).json({ project });
}

projectRouter.put(
  '/project_owner/projects/:id',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  upload.single('projectImage'),
  asyncWrap(projectOwnerChangeProjectState)
);
async function projectOwnerChangeProjectState(req, res) {
  const { id } = req.params;
  const coverImage = req.file;
  const updatedProject = req.body.project;
  const { user } = req;

  Object.keys(updatedProject)
    .filter(key => fieldsToParseJson.includes(key))
    .forEach((key) => {
      updatedProject[key] = JSON.parse(updatedProject[key]);
    });

  const existingProject = await Project.findById(id).exec();
  const allowedTransitions = ProjectOwnerAllowedTransitions[existingProject.state];
  const isUpdatedStateAllowed = updatedProject.state && allowedTransitions.includes(updatedProject.state);
  const { _id } = existingProject.projectOwner;
  const isCorrectProjectOwner = user.id.toString() === _id.toString();

  if ((isUpdatedStateAllowed || !updatedProject.state) && isCorrectProjectOwner) {
    existingProject.set(updatedProject);
    await existingProject.save();

    if (coverImage) {
      const response = await s3
        .upload({
          Body: coverImage.buffer,
          Key: `${new Date().getTime()}-${existingProject.id}-${existingProject.title}`,
          ACL: 'public-read',
          Bucket: `${config.AWS_BUCKET_NAME}/project_cover_images`,
        })
        .promise();
      existingProject.set({ coverImageUrl: response.Location });
      await existingProject.save();
    }

    return res
      .status(200)
      .json({ project: existingProject });
  }
  return res.status(422).json({
    errors: [
      new UnprocessableEntityErrorView(
        'Invalid state change.',
        'This change is not allowed.'
      ),
    ],
  });
}

// =============================================================================
// Admin Routes
// =============================================================================

projectRouter.put(
  '/admin/projects/:id',
  ...authMiddleware({ authorize: Role.ADMIN }),
  asyncWrap(adminChangeProjectState)
);
async function adminChangeProjectState(req, res) {
  const { id } = req.params;
  const updatedProject = req.body.project;

  const existingProject = await Project.findById(id).exec();
  const allowedTransitions = AdminAllowedTransitions[existingProject.state];

  if (
    updatedProject.state
    && allowedTransitions.includes(updatedProject.state)
  ) {
    if (
      updatedProject.state === ProjectState.REJECTED
      && !updatedProject.rejectionReason
    ) {
      return res.status(422).json({
        errors: [
          new UnprocessableEntityErrorView(
            'Invalid state change.',
            'This change is not allowed.'
          ),
        ],
      });
    }
    existingProject.set(updatedProject);
    await existingProject.save();
    return res.status(200).json({ project: existingProject });
  }
  return res.status(422).json({
    errors: [
      new UnprocessableEntityErrorView(
        'Invalid state change.',
        'This change is not allowed.'
      ),
    ],
  });
}
