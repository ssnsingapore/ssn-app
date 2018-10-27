
import { ProjectState } from 'models/Project';

export const ProjectOwnerAllowedTransitions = {
  [ProjectState.PENDING_APPROVAL]: [],
  [ProjectState.APPROVED_ACTIVE]: [ProjectState.APPROVED_INACTIVE],
  [ProjectState.APPROVED_INACTIVE]: [ProjectState.APPROVED_ACTIVE],
  [ProjectState.REJECTED]: [ProjectState.PENDING_APPROVAL],
};

export const AdminAllowedTransitions = {
  [ProjectState.PENDING_APPROVAL]: [ProjectState.APPROVED_ACTIVE, ProjectState.REJECTED],
  [ProjectState.APPROVED_ACTIVE]: [ProjectState.APPROVED_INACTIVE],
  [ProjectState.APPROVED_INACTIVE]: [ProjectState.APPROVED_ACTIVE],
  [ProjectState.REJECTED]: [],
};
