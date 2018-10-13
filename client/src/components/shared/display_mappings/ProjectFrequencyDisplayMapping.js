import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';

export const ProjectFrequencyDisplayMapping = {
  [ProjectFrequency.EVERY_DAY]: 'Every day',
  [ProjectFrequency.A_FEW_TIMES_A_WEEK]: 'A_FEW_TIMES_A_WEEK',
  [ProjectFrequency.ONCE_A_WEEK]: 'ONCE_A_WEEK',
  [ProjectFrequency.FORTNIGHTLY]: 'FORTNIGHTLY',
  [ProjectFrequency.A_FEW_TIMES_A_MONTH]: 'A_FEW_TIMES_A_MONTH',
  [ProjectFrequency.ONCE_A_MONTH]: 'ONCE_A_MONTH',
  [ProjectFrequency.A_FEW_TIMES_A_YEAR]: 'A_FEW_TIMES_A_YEAR',
  [ProjectFrequency.ONCE_A_YEAR]: 'ONCE_A_YEAR',
};