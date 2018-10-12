import React from 'react';

import { _testExports } from '../ProjectOwnerDetails';
import { defaultAppContext } from '../../main/AppContext';
import { AccountType } from 'components/shared/enums/AccountType';
import { CardMedia } from '@material-ui/core';
import { createShallow } from '@material-ui/core/test-utils';

const ProjectOwnerDetails = _testExports.ProjectOwnerDetails;
describe('ProjectOwnerDetails', () => {
  let component;
  let mockContext;
  let organisationProjectOwner;
  let individualProjectOwner;

  const shallow = createShallow();

  beforeEach(async (done) => {
    organisationProjectOwner = {
      name: 'some name',
      email: 'some@email.com',
      accountType: AccountType.ORGANISATION,
      websiteUrl: 'some website url',
      socialMediaLink: 'some social media link',
      profilePhotoUrl: 'some profile photo url',
      organisationName: 'some organisation name',
      description: 'some description',
    };
    individualProjectOwner = {
      name: 'some name',
      email: 'some@email.com',
      accountType: AccountType.INDIVIDUAL,
      websiteUrl: 'some website url',
      socialMediaLink: 'some social media link',
      profilePhotoUrl: 'some profile photo url',
      personalBio: 'some personal bio',
    };

    mockContext = { ...defaultAppContext };
    mockContext.utils.authenticator = {
      getCurrentUser: jest.fn(() => organisationProjectOwner),
    };

    component = shallow(
      <ProjectOwnerDetails classes={{}} context={mockContext} />,
      {
        disableLifeCycleMethods: true,
      }
    );
    await component.instance().componentDidMount();
    done();
  });

  describe('render', () => {
    describe('mandatory fields', () => {
      it('should render the profile photo', () => {
        expect(component.find(CardMedia).props().image).toEqual(organisationProjectOwner.profilePhotoUrl);
      });

      it('should render the name', () => {
        expect(component.html()).toEqual(
          expect.stringContaining(`<strong>Name: </strong>${organisationProjectOwner.name}`)
        );
      });

      it('should render the email', () => {
        expect(component.html()).toEqual(
          expect.stringContaining(`<strong>Email: </strong>${organisationProjectOwner.email}`)
        );
      });

      it('should render the account type', () => {
        expect(component.html()).toEqual(
          expect.stringContaining(`<strong>Account Type: </strong>${organisationProjectOwner.accountType}`)
        );
      });
    });

    describe('optional fields', () => {
      describe('when present', () => {
        it('should render the web url', () => {
          expect(component.html()).toEqual(
            expect.stringContaining(`<strong>Web URL: </strong>${organisationProjectOwner.websiteUrl}`)
          );
        });

        it('should render the social media link', () => {
          expect(component.html()).toEqual(
            expect.stringContaining(`<strong>Social Media Link: </strong>${organisationProjectOwner.socialMediaLink}`)
          );
        });
      });

      describe('when absent', () => {
        beforeEach(async (done) => {
          organisationProjectOwner = {
            ...organisationProjectOwner,
            websiteUrl: undefined,
            socialMediaLink: undefined,
          };
          mockContext = { ...defaultAppContext };
          mockContext.utils.authenticator = {
            getCurrentUser: jest.fn(() => organisationProjectOwner),
          };

          component = shallow(
            <ProjectOwnerDetails classes={{}} context={mockContext} />,
            {
              disableLifeCycleMethods: true,
            }
          );
          await component.instance().componentDidMount();
          done();
        });

        it('should render dashes', () => {
          expect(component.html()).toEqual(
            expect.stringContaining('<strong>Web URL: </strong>-')
          );
          expect(component.html()).toEqual(
            expect.stringContaining('<strong>Social Media Link: </strong>-')
          );
        });
      });
    });

    describe('when account type is organisation', () => {
      it('should render the organisation name', () => {
        expect(component.html()).toEqual(
          expect.stringContaining(`<strong>Organisation Name: </strong>${organisationProjectOwner.organisationName}`)
        );
      });

      it('should render the description instead of personal bio or dash if absent', () => {
        expect(component.html()).toEqual(
          expect.stringContaining(`<strong>Description: </strong>${organisationProjectOwner.description}`)
        );
        expect(component.html().match('<strong>Personal Bio: </strong>')).toBeNull();
      });
    });

    describe('when account type is individual', () => {
      beforeEach(async (done) => {
        mockContext = { ...defaultAppContext };
        mockContext.utils.authenticator = {
          getCurrentUser: jest.fn(() => individualProjectOwner),
        };

        component = shallow(
          <ProjectOwnerDetails classes={{}} context={mockContext} />,
          {
            disableLifeCycleMethods: true,
          }
        );
        await component.instance().componentDidMount();
        done();
      });

      it('should not render organisation name', () => {
        expect(component.html().match('<strong>Organisation Name: </strong>')).toBeNull();
      });

      it('should render the personal bio instead of description or dash if absent', () => {
        expect(component.html()).toEqual(
          expect.stringContaining(`<strong>Personal Bio: </strong>${individualProjectOwner.personalBio}`)
        );
        expect(component.html().match('<strong>Description: </strong>')).toBeNull();
      });
    });
  });
});