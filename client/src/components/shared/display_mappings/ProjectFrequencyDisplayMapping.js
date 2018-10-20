import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';

export const ProjectFrequencyDisplayMapping = {
  [ProjectFrequency.EVERY_DAY]: 'Every day',
  [ProjectFrequency.A_FEW_TIMES_A_WEEK]: 'A few times a week',
  [ProjectFrequency.ONCE_A_WEEK]: 'Once a week',
  [ProjectFrequency.FORTNIGHTLY]: 'Fortnightly',
  [ProjectFrequency.A_FEW_TIMES_A_MONTH]: 'A few times a month',
  [ProjectFrequency.ONCE_A_MONTH]: 'Once a month',
  [ProjectFrequency.A_FEW_TIMES_A_YEAR]: 'A few times a year',
  [ProjectFrequency.ONCE_A_YEAR]: 'Once a year',
};