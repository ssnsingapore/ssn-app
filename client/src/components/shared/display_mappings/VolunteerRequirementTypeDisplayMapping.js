import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';

export const VolunteerRequirementTypeDisplayMapping = {
  [VolunteerRequirementType.INTERACTION]: 'Interaction',
  [VolunteerRequirementType.CONTENT_CREATION]: 'Content Creation',
  [VolunteerRequirementType.EVENT_PLANNING]: 'Event Planning',
  [VolunteerRequirementType.MEDIA_AND_SOCIAL_MEDIA]: 'Media and Social Media',
  [VolunteerRequirementType.EXPERT_VOLUNTEERS]: 'Expert Volunteers',
  [VolunteerRequirementType.ADHOC_MANPOWER_SUPPORT]: 'Adhoc Manpower Support',
  [VolunteerRequirementType.OTHERS_SKILLED]: 'Others (Skilled)',
  [VolunteerRequirementType.OTHERS_ADHOC]: 'Others (Ad-hoc)',
};
