import React from 'react';
import moment from 'moment';
import { Typography, Chip, CardMedia } from '@material-ui/core';

import { ProjectListingCard } from '../ProjectListingCard';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { ProjectType } from 'components/shared/enums/ProjectType';
import { ProjectRegion } from 'components/shared/enums/ProjectRegion';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';

const shallowRender = (overrideAttributes) => {

  return shallow(
    <ProjectListingCard
      project={{
        title: 'Cat Adoption Drive',
        coverImageUrl:
          'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Singapore-Cat-Festival-2018.jpg',
        description: 'Cat adoption drive description',
        volunteerSignupUrl: '',
        volunteerRequirements: [
          {
            type: [VolunteerRequirementType.INTERACTION],
            commitmentLevel: 'Once a Week',
            number: 5,
          },
        ],
        projectOwner: {
          name: 'Cat Society',
          profilePhotoUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Singapore-Cat-Festival-2018.jpg',
        },
        issuesAddressed: [IssueAddressed.AIR_QUALITY, IssueAddressed.CONSERVATION],
        volunteerRequirementsDescription: 'requirementDescription2',
        volunteerBenefitsDescription: 'lunch',
        projectType: ProjectType.EVENT,
        time: '10 AM',
        location: ProjectRegion.WEST,
        state: ProjectState.PENDING_APPROVAL,
        startDate: moment('2018-10-01').toDate(),
        endDate: moment('2018-10-01').toDate(),
        frequency: ProjectFrequency.ONCE_A_WEEK,
        rejectionReason: 'rejected',
        ...overrideAttributes,
      }}
    />
  ).dive();
};

describe('ProjectListingCard', () => {
  let component;

  describe('render', () => {
    it('should render the project cover image', () => {
      component = shallowRender({
        coverImageUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Singapore-Cat-Festival-2018.jpg',
      });

      expect(component.find(CardMedia).props().image).toEqual('https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Singapore-Cat-Festival-2018.jpg');
    });

    describe('event date or frequency information', () => {
      describe('when the project type is EVENT', () => {
        it('renders the start date when the start date and end date are the same', () => {
          component = shallowRender({
            projectType: ProjectType.EVENT,
            startDate: moment('2018-12-12').toDate(),
            endDate: moment('2018-12-12').toDate(),
          });

          const dateString = 'Wednesday, 12th December 2018';
          expect(component.find('[data-testid="event-dates"]').props().children).toEqual(dateString);
        });

        it('renders a date range when the start date and end date are different', () => {
          component = shallowRender({
            projectType: ProjectType.EVENT,
            startDate: moment('2018-12-12').toDate(),
            endDate: moment('2018-12-30').toDate(),
          });

          const dateString = 'Wednesday, 12th December 2018 - Sunday, 30th December 2018';
          expect(component.find('[data-testid="event-dates"]').props().children).toEqual(dateString);
        });

        it('renders a badge with the start date', () => {
          component = shallowRender({
            projectType: ProjectType.EVENT,
            startDate: moment('2018-12-12').toDate(),
            endDate: moment('2018-12-30').toDate(),
          });

          const month = component.find('[data-testid="date-badge"]').find(Typography).at(0);
          const date = component.find('[data-testid="date-badge"]').find(Typography).at(1);

          expect(month.props().children).toEqual('Dec');
          expect(date.props().children.props.children).toEqual('12');
        });
      });

      describe('when the project type is RECURRING', () => {
        it('renders the frequency of recurrence', () => {
          component = shallowRender({
            projectType: ProjectType.RECURRING,
            frequency: ProjectFrequency.EVERY_DAY,
          });

          expect(component.find('[data-testid="frequency"]').props().children.join('')).toEqual('Recurs every day');
        });
      });
    });

    it('should render the project title', () => {
      component = shallowRender({
        title: 'Some title',
      });

      expect(component.find('[data-testid="title"]').props().children).toEqual('Some Title');
    });

    it('should render the project owner name and avatar', () => {
      component = shallowRender({
        projectOwner: {
          name: 'Cat Society',
          profilePhotoUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Singapore-Cat-Festival-2018.jpg',
        },
      });

      expect(component.find('[data-testid="project-owner-avatar"]').props().src).toEqual('https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Singapore-Cat-Festival-2018.jpg');
      expect(component.find('[data-testid="project-owner-name"]').props().primary).toEqual('Cat Society');
    });

    describe('project description', () => {
      it('should render the full description if under 320 characters', () => {
        component = shallowRender({
          description: 'A short description',
        });

        expect(component.find('[data-testid="description"]').props().children).toEqual('A short description');
      });

      it('should render a truncated description with ellipses if over 320 characters', () => {
        component = shallowRender({
          description: 'A longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong description',
        });

        expect(component.find('[data-testid="description"]').props().children).toEqual('A longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglo...');
      });
    });

    describe('volunteer requirements', () => {
      it('should render a dash if there are no volunteer requirements', () => {
        component = shallowRender({
          volunteerRequirements: [],
        });

        expect(component.find('[data-testid="no-volunteer-requirements"]').props().children).toEqual('-');
      });

      it('should render volunteer requirements as chips', () => {
        component = shallowRender({
          volunteerRequirements: [
            {
              type: VolunteerRequirementType.INTERACTION,
              commitmentLevel: 'any',
              number: 1,
            },
            {
              type: VolunteerRequirementType.CONTENT_CREATION,
              commitmentLevel: 'any',
              number: 1,
            },
          ],
        });

        expect(component.find('[data-testid="volunteer-requirements"]').find(Chip).at(0).props().label).toEqual('Interaction');
        expect(component.find('[data-testid="volunteer-requirements"]').find(Chip).at(1).props().label).toEqual('Content Creation');
      });
    });

    describe('issues addressed', () => {
      it('should render a dash if there are no issues addressed', () => {
        component = shallowRender({
          issuesAddressed: [],
        });

        expect(component.find('[data-testid="no-issues-addressed"]').props().children).toEqual('-');
      });

      it('should render issues addressed as chips', () => {
        component = shallowRender({
          issuesAddressed: [
            IssueAddressed.AIR_QUALITY,
            IssueAddressed.CONSERVATION,
          ],
        });

        expect(component.find('[data-testid="issues-addressed"]').find(Chip).at(0).props().label).toEqual('Air Quality');
        expect(component.find('[data-testid="issues-addressed"]').find(Chip).at(1).props().label).toEqual('Conservation');
      });
    });
  });
});