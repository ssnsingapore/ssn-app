import { IssueAddressed } from 'components/shared/enums/IssueAddressed';

export const convertToAbsoluteUrl = (inputUrl) => {
  const httpPatternRegex = /^http(s?):\/\//;
  if (!httpPatternRegex.test(inputUrl)) {
    return 'http://' + inputUrl;
  }
  return inputUrl;
};

const DefaultCoverImage = {
  [IssueAddressed.AIR_QUALITY]: 'Air-Quality.jpg',
  [IssueAddressed.AWARENESS_AND_EDUCATION]: 'Awareness-and-Education.jpg',
  [IssueAddressed.BIODIVERSITY]: 'Biodiversity.jpg',
  [IssueAddressed.CLIMATE]: 'Climate.jpg',
  [IssueAddressed.CONSERVATION]: 'Conservation.jpg',
  [IssueAddressed.ENERGY]: 'Energy.jpg',
  [IssueAddressed.FOOD_AND_AGRICULTURE]: 'Food-and-Agriculture.jpg',
  [IssueAddressed.GREEN_LIFESTYLE]: 'Green-Lifestyle.jpg',
  [IssueAddressed.LAND_AND_NOISE_POLLUTION]: 'Land-and-Noise-Pollution.jpg',
  [IssueAddressed.PLANNING_AND_TRANSPORTATION]: 'Planning-and-Transportation.jpg',
  [IssueAddressed.PRODUCTION_AND_CONSUMPTION]: 'Production-and-Consumption.jpg',
  [IssueAddressed.OTHER]: 'Other.jpg',
  [IssueAddressed.SPORTS_AND_RECREATION]: 'Recreation-and-Sports.jpg',
  [IssueAddressed.WASTE]: 'Waste.jpg',
  [IssueAddressed.WATER]: 'Water.jpg',
  [IssueAddressed.GREEN_TECHNOLOGY]: 'Green-Technology.jpg',
};

export const getDefaultImageUrlIfBlank = ( imageUrl = '', issues = [] ) => {
  if(imageUrl) {
    return imageUrl;
  }
  let primaryIssue = [IssueAddressed.OTHER];
  if(issues.length > 0) {
    primaryIssue = issues[0];
  }
  return require(`assets/issues-addressed-default/${DefaultCoverImage[primaryIssue]}`);
};