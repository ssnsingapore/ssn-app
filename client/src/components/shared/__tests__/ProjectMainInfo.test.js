import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectType } from 'components/shared/enums/ProjectType';
import React from 'react';
import { _testExports } from '../ProjectMainInfo';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';
import {
  Card,
  Typography,
  Button,
  Paper,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Table,
} from '@material-ui/core';


const ProjectMainInfo = _testExports.ProjectMainInfo;

const buildProject = (projectType, overrideAttributes = {}) => {
  const baseProject = {
    title: 'some title',
    coverImageUrl: 'some cover image url',
    description: 'some description',
    volunteerSignupUrl: 'some signup url',
    volunteerRequirements: [
      {
        _id: '5bcae113f8180c1c495486f7',
        type: VolunteerRequirementType.INTERACTION,
        commitmentLevel: 'Once a Week',
        number: 5,
      },
      {
        _id: '5bcae113f8180c1c495486f2',
        type: VolunteerRequirementType.CONTENT_CREATION,
        commitmentLevel: 'Once a Week',
        number: 5,
      },
    ],
    projectOwner: { /* not used */ },
    issuesAddressed: [IssueAddressed.OTHER],
    volunteerRequirementsDescription: 'some volunteer requirement description',
    volunteerBenefitsDescription: 'some volunteer benefits description',
    time: '9 AM',
    location: ProjectLocation.EAST,
    state: ProjectState.PENDING_APPROVAL,
    rejectionReason: 'some rejection reason',
  };

  const eventAttributes = {
    projectType: ProjectType.EVENT,
    startDate: '2018-10-20T08:02:27.299Z',
    endDate: '2018-10-20T08:02:27.299Z',
  };

  const recurringAttributes = {
    projectType: ProjectType.RECURRING,
    frequency: ProjectFrequency.ONCE_A_WEEK,
  };

  return {
    ...baseProject,
    ...(projectType === ProjectType.EVENT ? eventAttributes : recurringAttributes),
    ...overrideAttributes,
  };
};

const shallowRender = (project) => {
  return shallow(
    <ProjectMainInfo classes={{}} project={project} />,
    {
      disableLifeCycleMethods: true,
    }
  );
};
describe('ProjectMainInfo', () => {
  let component;
  let project;

  beforeEach(() => {
    project = buildProject(ProjectType.EVENT);
    component = shallowRender(project);
  });

  describe('render', () => {
    describe('project base details', () => {
      let baseDetailsCard;

      beforeEach(() => {
        baseDetailsCard = component.find(Card);
      });

      it('should render the title, description, volunteer signup url, and cover image', () => {
        const titleComponent = baseDetailsCard.find(Typography).at(0);
        const descriptionComponent = baseDetailsCard.find(Typography).at(1);
        const signUpButton = baseDetailsCard.find(Button);
        expect(titleComponent.html()).toEqual(
          expect.stringContaining('some title'),
        );
        expect(descriptionComponent.html()).toEqual(
          expect.stringContaining('some description'),
        );
        expect(signUpButton.html()).toEqual(
          expect.stringContaining('Sign up as a volunteer!'),
        );
        expect(signUpButton.props().href).toEqual('http://some signup url');
      });

      it('should render the volunteer signup url correctly if there is already http scheme', () => {
        project = buildProject(ProjectType.EVENT, { volunteerSignupUrl: 'https://someurl.com' });
        component = shallowRender(project);

        baseDetailsCard = component.find(Card);
        const signUpButton = baseDetailsCard.find(Button);
        expect(signUpButton.props().href).toEqual('https://someurl.com');
      });
    });

    describe('volunteer details', () => {
      let volunteerDetailsCard;

      beforeEach(() => {
        volunteerDetailsCard = component.find(Paper).at(0);
      });

      it('should render volunteer requirement description and benefits description', () => {
        expect(volunteerDetailsCard.html()).toEqual(
          expect.stringContaining('Volunteer Details')
        );
        expect(volunteerDetailsCard.html()).toEqual(
          expect.stringContaining('We need the following volunteers:')
        );
        expect(volunteerDetailsCard.html()).toEqual(
          expect.stringContaining('some volunteer requirement description')
        );
        expect(volunteerDetailsCard.html()).toEqual(
          expect.stringContaining('Volunteer benefits:')
        );
        expect(volunteerDetailsCard.html()).toEqual(
          expect.stringContaining('some volunteer benefits description')
        );
      });

      it('should render volunteer requirements table', () => {
        const tableHeader = volunteerDetailsCard.find(TableHead);
        expect(tableHeader.find(TableCell).at(0).html()).toEqual(
          expect.stringContaining('Volunteer Roles'),
        );
        expect(tableHeader.find(TableCell).at(1).html()).toEqual(
          expect.stringContaining('No. of Volunteers'),
        );
        expect(tableHeader.find(TableCell).at(2).html()).toEqual(
          expect.stringContaining('Commitment Level'),
        );

        const tableBody = volunteerDetailsCard.find(TableBody);
        expect(tableBody.find(TableRow).length).toEqual(2);
        const firstRow = tableBody.find(TableRow).at(0);
        expect(firstRow.find(TableCell).at(0).html()).toEqual(
          expect.stringContaining('Interaction'),
        );
        expect(firstRow.find(TableCell).at(1).html()).toEqual(
          expect.stringContaining('5 volunteers'),
        );
        expect(firstRow.find(TableCell).at(2).html()).toEqual(
          expect.stringContaining('Once a Week'),
        );
        const secondRow = tableBody.find(TableRow).at(1);
        expect(secondRow.find(TableCell).at(0).html()).toEqual(
          expect.stringContaining('Content Creation'),
        );
        expect(secondRow.find(TableCell).at(1).html()).toEqual(
          expect.stringContaining('5 volunteers'),
        );
        expect(secondRow.find(TableCell).at(2).html()).toEqual(
          expect.stringContaining('Once a Week'),
        );
      });

      describe('when there are no volunteer requirements and no volunteer requirement description', () => {
        it('should render a dash instead of table and description text', () => {
          project = buildProject(ProjectType.EVENT, {
            volunteerRequirements: [],
            volunteerRequirementsDescription: '',
          });
          component = shallowRender(project);
          volunteerDetailsCard = component.find(Paper).at(0);

          expect(volunteerDetailsCard.find('div').props().children).toEqual('-');
        });
      });

      describe('when there is no volunteer requirement description', () => {
        it('should render the requirements table but not any text', () => {
          project = buildProject(ProjectType.EVENT, {
            volunteerRequirementsDescription: '',
          });
          component = shallowRender(project);
          volunteerDetailsCard = component.find(Paper).at(0);

          expect(volunteerDetailsCard.find(Table).exists()).toBeTruthy();
          expect(volunteerDetailsCard.find('[data-test-id="volunteerRequirementHeadline"]').exists()).toBeTruthy();
          expect(volunteerDetailsCard.find('[data-test-id="volunteerRequirementDescription"]').exists()).toBeFalsy();
        });
      });

      describe('when there are no volunteer requirements', () => {
        it('should render the requirements text but not table or headline', () => {
          project = buildProject(ProjectType.EVENT, {
            volunteerRequirements: [],
          });
          component = shallowRender(project);
          volunteerDetailsCard = component.find(Paper).at(0);

          expect(volunteerDetailsCard.find(Table).exists()).toBeFalsy();
          expect(volunteerDetailsCard.find('[data-test-id="volunteerRequirementHeadline"]').exists()).toBeFalsy();
          expect(volunteerDetailsCard.find('[data-test-id="volunteerRequirementDescription"]').exists()).toBeTruthy();
        });
      });

      describe('when there is no volunteer benefits description', () => {
        project = buildProject(ProjectType.EVENT, {
          volunteerBenefitsDescription: '',
        });
        component = shallowRender(project);
        volunteerDetailsCard = component.find(Paper).at(0);

        expect(volunteerDetailsCard.html()).toEqual(
          expect.stringMatching(/Volunteer benefits:<\/\w*>-/),
        );

      });
    });

    describe('project details', () => {
      let projectDetailsCard;

      describe('when the project type is EVENT', () => {
        beforeEach(() => {
          project = buildProject(ProjectType.EVENT, {
            startDate: '2018-10-20T08:02:27.299Z',
            endDate: '2018-10-20T08:02:27.299Z',
          });
          component = shallowRender(project);
          projectDetailsCard = component.find(Paper).at(1);
        });

        it('should render the projectType, startDate, endDate, time, location and issuesAddressed', () => {
          expect(projectDetailsCard.find(Typography).at(0).html()).toEqual(
            expect.stringContaining('Project Details'),
          );
          expect(projectDetailsCard.find(Typography).at(1).html()).toEqual(
            expect.stringContaining('Project Type'),
          );
          expect(projectDetailsCard.find(Typography).at(1).html()).toEqual(
            expect.stringContaining('Event'),
          );
          expect(projectDetailsCard.find(Typography).at(2).html()).toEqual(
            expect.stringContaining('Start date'),
          );
          expect(projectDetailsCard.find(Typography).at(2).html()).toEqual(
            expect.stringContaining('Saturday, 20th October 2018'),
          );
          expect(projectDetailsCard.find(Typography).at(3).html()).toEqual(
            expect.stringContaining('End date'),
          );
          expect(projectDetailsCard.find(Typography).at(3).html()).toEqual(
            expect.stringContaining('Saturday, 20th October 2018'),
          );
          expect(projectDetailsCard.find(Typography).at(4).html()).toEqual(
            expect.stringContaining('Time'),
          );
          expect(projectDetailsCard.find(Typography).at(4).html()).toEqual(
            expect.stringContaining('9:00 AM'),
          );
          expect(projectDetailsCard.find(Typography).at(5).html()).toEqual(
            expect.stringContaining('Location'),
          );
          expect(projectDetailsCard.find(Typography).at(5).html()).toEqual(
            expect.stringContaining('East'),
          );
          expect(projectDetailsCard.find(Typography).at(6).html()).toEqual(
            expect.stringContaining('Issues Addressed'),
          );
          expect(projectDetailsCard.find(Typography).at(6).html()).toEqual(
            expect.stringContaining('Other'),
          );
        });

        it('should not render frequency', () => {
          expect(projectDetailsCard.html().match('Frequency')).toBeNull();
        });
      });

      describe('when the project type is RECURRING', () => {
        beforeEach(() => {
          project = buildProject(ProjectType.RECURRING, {
            frequency: ProjectFrequency.EVERY_DAY,
          });
          component = shallowRender(project);
          projectDetailsCard = component.find(Paper).at(1);
        });

        it('should render the projectType, frequency, time, location and issuesAddressed', () => {
          expect(projectDetailsCard.find(Typography).at(0).html()).toEqual(
            expect.stringContaining('Project Details'),
          );
          expect(projectDetailsCard.find(Typography).at(1).html()).toEqual(
            expect.stringContaining('Project Type'),
          );
          expect(projectDetailsCard.find(Typography).at(1).html()).toEqual(
            expect.stringContaining('Recurring'),
          );
          expect(projectDetailsCard.find(Typography).at(2).html()).toEqual(
            expect.stringContaining('Frequency'),
          );
          expect(projectDetailsCard.find(Typography).at(2).html()).toEqual(
            expect.stringContaining('Every day'),
          );
          expect(projectDetailsCard.find(Typography).at(3).html()).toEqual(
            expect.stringContaining('Time'),
          );
          expect(projectDetailsCard.find(Typography).at(3).html()).toEqual(
            expect.stringContaining('9:00 AM'),
          );
          expect(projectDetailsCard.find(Typography).at(4).html()).toEqual(
            expect.stringContaining('Location'),
          );
          expect(projectDetailsCard.find(Typography).at(4).html()).toEqual(
            expect.stringContaining('East'),
          );
          expect(projectDetailsCard.find(Typography).at(5).html()).toEqual(
            expect.stringContaining('Issues Addressed'),
          );
          expect(projectDetailsCard.find(Typography).at(5).html()).toEqual(
            expect.stringContaining('Other'),
          );
        });

        it('should not render start date or end date', () => {
          expect(projectDetailsCard.html().match('Start date')).toBeNull();
          expect(projectDetailsCard.html().match('End date')).toBeNull();
        });
      });

      describe('optional fields', () => {
        beforeEach(() => {
          project = buildProject(ProjectType.RECURRING, {
            time: undefined,
            location: undefined,
            issuesAddressed: [],
          });
          component = shallowRender(project);
          projectDetailsCard = component.find(Paper).at(1);
        });

        describe('when no time is specified', () => {
          it('should render a dash', () => {
            expect(projectDetailsCard.find(Typography).at(3).html()).toEqual(
              expect.stringContaining('<strong>Time: </strong>-'),
            );
          });
        });

        describe('when no location is specified', () => {
          it('should render a dash', () => {
            expect(projectDetailsCard.find(Typography).at(4).html()).toEqual(
              expect.stringContaining('<strong>Location: </strong>-'),
            );
          });
        });

        describe('when no issues addressed are specified', () => {
          it('should render a dash', () => {
            expect(projectDetailsCard.find(Typography).at(5).html()).toEqual(
              expect.stringContaining('<strong>Issues Addressed: </strong>-'),
            );
          });
        });
      });
    });
  });
});