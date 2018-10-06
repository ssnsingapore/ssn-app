import { ProjectState } from 'components/shared/enums/ProjectState';

export const ProjectStateDisplayMapping = {
  [ProjectState.PENDING_APPROVAL]: 'Pending Approval',
  [ProjectState.APPROVED_ACTIVE]: 'Active',
  [ProjectState.APPROVED_INACTIVE]: 'Inactive',
  [ProjectState.REJECTED]: 'Rejected',
};
