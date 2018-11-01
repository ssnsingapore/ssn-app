import { getFieldNameObject } from 'util/form';
import { ProjectType } from 'components/shared/enums/ProjectType';

export const FieldName = getFieldNameObject([
  'title',
  'description',
  'volunteerSignupUrl',

  'volunteerRequirementsDescription',
  'volunteerBenefitsDescription',

  'projectType',
  'startDate',
  'endDate',
  'frequency',
  'time',
  'location',
  'issuesAddressed',
]);

export const constraints = {
  [FieldName.title]: {
    presence: { allowEmpty: false },
    length: { maximum: 50 },
  },
  [FieldName.description]: {
    presence: { allowEmpty: false },
    length: { maximum: 5000 },
  },
  [FieldName.volunteerSignupUrl]: {
    isUrl: { allowEmpty: true },
  },

  [FieldName.volunteerRequirementsDescription]: {
    length: { maximum: 500 },
  },
  [FieldName.volunteerBenefitsDescription]: {
    length: { maximum: 500 },
  },

  [FieldName.projectType]: {
    presence: { allowEmpty: false },
  },
  [FieldName.startDate]: (value, attributes) => {
    if (attributes.projectType === ProjectType.RECURRING) return null;

    return {
      datetime: {
        dateOnly: true,
        latest: attributes.endDate,
      },
      presence: { allowEmpty: false },
    };
  },
  [FieldName.endDate]: (value, attributes) => {
    if (attributes.projectType === ProjectType.RECURRING) return null;

    return {
      datetime: {
        dateOnly: true,
        earliest: attributes.startDate,
      },
      presence: { allowEmpty: false },
    };
  },
  [FieldName.frequency]: (value, attributes) => {
    if (attributes.projectType === ProjectType.EVENT) return null;

    return {
      presence: { allowEmpty: false },
    };
  },
};