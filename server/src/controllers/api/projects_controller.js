import moment from 'moment';
import express from 'express';
import multer from 'multer';

import { asyncWrap } from 'util/async_wrapper';
import {
  Project, ProjectState, ProjectType, ProjectFrequency,
} from 'models/Project';
import { ProjectOwner } from 'models/ProjectOwner';
// eslint-disable-next-line no-unused-vars
import { Role } from 'models/Role';
import { UnprocessableEntityErrorView } from 'util/errors';
import {
  ProjectOwnerAllowedTransitions,
  AdminAllowedTransitions,
} from 'config/stateChangePermissions';
import { s3 } from 'config/aws';
import { config } from 'config/environment';
import { authMiddleware } from 'util/auth';

const MonthValue = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
};

export const projectRouter = express.Router();
const upload = multer();

projectRouter.get('/projects', asyncWrap(getProjects));
async function getProjects(req, res) {
  const pageSize = Number(req.query.pageSize) || 10;
  const {
    projectState = ProjectState.APPROVED_ACTIVE,
  } = req.query;

  const sortParams = projectState === ProjectState.PENDING_APPROVAL
    ? { createdAt: 'ascending' }
    : { updatedAt: 'descending' };

  const recurringWithinMonthObj = {
    $and: [
      { projectType: ProjectType.RECURRING },
      {
        frequency: {
          $in: [ProjectFrequency.EVERY_DAY, ProjectFrequency.A_FEW_TIMES_A_WEEK, ProjectFrequency.ONCE_A_WEEK,
            ProjectFrequency.FORTNIGHTLY, ProjectFrequency.A_FEW_TIMES_A_MONTH, ProjectFrequency.ONCE_A_MONTH],
        },
      },
    ],
  };

  const eventWithinMonthObj = month => ({
    $and: [
      { projectType: ProjectType.EVENT },
      { month: MonthValue[month] },
    ],
  });

  const constructFilterParams = Object.keys(req.query).map((param) => {
    switch (param) {
      case 'month':
        return {
          $or: [
            eventWithinMonthObj(req.query[param]),
            recurringWithinMonthObj,
          ],
        };
      case 'issueAddressed':
        return {
          issuesAddressed: req.query[param],
        };
      case 'projectRegion':
        return {
          region: req.query[param],
        };
      case 'projectState':
        return {
          state: req.query[param],
        };
      case 'pageSize':
        return {};
      case 'volunteerRequirementType':
        return {
          'volunteerRequirements.type': req.query[param],
        };
      default:
        return { [param]: req.query[param] };
    }
  });

  let constructProjectInclusionField = {};
  Object.keys(Project.schema.paths).forEach((field) => { constructProjectInclusionField = { ...constructProjectInclusionField, [field]: 1 }; });

  const aggrProjects = await Project.aggregate([
    {
      $project: {
        ...constructProjectInclusionField,
        month: { $month: '$startDate' },
      },
    },
    {
      $match:
      {
        $and: constructFilterParams,
      },
    },
    {
      $limit: pageSize,
    },
  ])
    .sort(sortParams)
    .exec();
  const projects = await ProjectOwner.populate(aggrProjects, { path: 'projectOwner' });

  return res.status(200).json({ projects });
}

projectRouter.get('/project_counts', asyncWrap(getProjectCounts));
async function getProjectCounts(req, res) {
  const { issueAddressed, projectRegion } = req.query;
  const counts = {};
  const projectStates = Object.keys(ProjectState);

  const filterParams = {
    ...(issueAddressed && { issuesAddressed: issueAddressed }),
    ...(projectRegion && { region: projectRegion }),
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

projectRouter.post(
  '/project_owner/projects/new',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  upload.single('projectImage'),
  asyncWrap(postProject)
);

async function postProject(req, res) {
  const { file } = req;

  const newProject = JSON.parse(req.body.project);
  console.log('new', newProject);

  const project = new Project({
    ...newProject,
    startDate: moment(newProject.startDate).toDate(),
    endDate: moment(newProject.endDate).toDate(),
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
  const updatedProject = JSON.parse(req.body.project);
  const { user } = req;

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
