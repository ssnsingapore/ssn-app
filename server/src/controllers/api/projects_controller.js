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
import {
  UnprocessableEntityErrorView,
  ForbiddenErrorView,
} from 'util/errors';
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

function constructFilterParams(queryParams, projectState) {
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

  const paramMap = {
    issueAddressed: 'issuesAddressed',
    projectRegion: 'region',
    projectState: 'state',
    volunteerRequirementType: 'volunteerRequirements.type',
  };

  const filterParams = Object.keys(paramMap)
    .filter(item => queryParams[item] !== undefined)
    .map(key => ({ [paramMap[key]]: queryParams[key] }));

  if (queryParams.month) {
    filterParams.push({
      $or: [
        eventWithinMonthObj(queryParams.month),
        recurringWithinMonthObj,
      ],
    });
  }

  if (!queryParams.projectState && !projectState) {
    filterParams.push({ state: ProjectState.APPROVED_ACTIVE });
  } else if (projectState) {
    filterParams.push({ state: projectState });
  }

  return filterParams;
}

function constructProjectInclusionField() {
  let projectInclusionField = {};
  Object.keys(Project.schema.paths).forEach((field) => { projectInclusionField = { ...projectInclusionField, [field]: 1 }; });
  return projectInclusionField;
}

projectRouter.get('/projects', asyncWrap(getProjects));
async function getProjects(req, res) {
  const pageSize = Number(req.query.pageSize) || 10;
  const {
    projectState = ProjectState.APPROVED_ACTIVE,
    page = 1,
  } = req.query;

  const sortParams = projectState === ProjectState.PENDING_APPROVAL
    ? { createdAt: 1 }
    : { updatedAt: -1 };

  const aggrProjects = await Project.aggregate([
    {
      $project: {
        ...constructProjectInclusionField(),
        month: { $month: { date: '$startDate', timezone: '+08:00' } },
      },
    },
    {
      $match:
        (Object.keys(req.query).length !== 0) ? {
          $and: constructFilterParams(req.query),
        } : { state: ProjectState.APPROVED_ACTIVE },
    },
    {
      $sort: sortParams,
    },
    {
      $skip: (page - 1) * pageSize,
    },
    {
      $limit: pageSize,
    },
  ])
    .exec();

  const projects = await ProjectOwner.populate(aggrProjects, { path: 'projectOwner' });

  return res.status(200).json({ projects });
}

projectRouter.get('/project_counts', asyncWrap(getProjectCounts));
async function getProjectCounts(req, res) {
  const counts = {};
  const projectStates = Object.keys(ProjectState);

  for (let i = 0; i < projectStates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const aggrCountProjects = await Project.aggregate([
      {
        $project: {
          ...constructProjectInclusionField(),
          month: { $month: { date: '$startDate', timezone: '+08:00' } },
        },
      },
      {
        $match: {
          $and: constructFilterParams(req.query, projectStates[i]),
        },
      },
      {
        $count: 'count',
      },
    ])
      .exec();
    counts[projectStates[i]] = aggrCountProjects.length !== 0 ? aggrCountProjects[0].count : 0;
  }

  return res.status(200).json({ counts });
}

projectRouter.get('/projects/:id', asyncWrap(getProjectForPublic));
async function getProjectForPublic(req, res) {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate('projectOwner')
    .exec();

  const isProjectForPublic = project.state === ProjectState.APPROVED_ACTIVE || project.state === ProjectState.APPROVED_INACTIVE;

  if (isProjectForPublic) {
    return res.status(200).json({ project });
  }
  return res.status(403).json({
    errors: [new ForbiddenErrorView()],
  });
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
  const page = Number(req.query.page) || 1;
  const { projectState = ProjectState.APPROVED_ACTIVE } = req.query;

  const sortParams = projectState === ProjectState.PENDING_APPROVAL
    ? { createdAt: 1 }
    : { updatedAt: -1 };

  const projects = await Project.find({
    state: projectState,
    projectOwner: user.id,
  })
    .sort(sortParams)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate('projectOwner')
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

projectRouter.get(
  '/project_owner/projects/:id',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  asyncWrap(getProjectForProjectOwner)
);
async function getProjectForProjectOwner(req, res) {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate('projectOwner')
    .exec();

  const { _id } = project.projectOwner;
  const isCorrectProjectOwner = req.user.id.toString() === _id.toString();

  if (isCorrectProjectOwner) {
    return res.status(200).json({ project });
  }
  return res.status(403).json({
    errors: [new ForbiddenErrorView()],
  });
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
          Key: `${new Date().getTime()}-${existingProject.id}-${
            existingProject.title
          }`,
          ACL: 'public-read',
          Bucket: `${config.AWS_BUCKET_NAME}/project_cover_images`,
        })
        .promise();

      existingProject.set({ coverImageUrl: response.Location });
    }
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

// =============================================================================
// Admin Routes
// =============================================================================

projectRouter.get(
  '/admins/projects/:id',
  ...authMiddleware({ authorize: Role.ADMIN }),
  asyncWrap(getProjectForAdmin)
);
async function getProjectForAdmin(req, res) {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate('projectOwner')
    .exec();

  return res.status(200).json({ project });
}

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
