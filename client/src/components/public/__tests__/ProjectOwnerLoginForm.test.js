import React from 'react';
import { TextField, Button, Typography } from '@material-ui/core';
import { TestProjectOwnerLoginForm } from 'components/public/ProjectOwnerLoginForm';
import { AlertType } from 'components/shared/Alert';
import { PasswordResetDialog } from '../PasswordResetDialog';
import { Role } from 'components/shared/enums/Role';
import { defaultAppContext } from 'components/main/AppContext';
import { Redirect } from 'react-router-dom';

describe('ProjectOwnerLoginForm', () => {
  const LOGIN_SUCCESS_MESSAGE = 'You\'ve successfully logged in!';
  const LOGIN_FAILURE_MESSAGE = 'Looks like you\'ve keyed in the wrong credentials. Try again!';

  describe('when project owner is not logged in', () => {
    describe('render', () => {
      let props;
      let component;

      beforeEach(() => {
        props = {
          classes: {},
          context: {
            updaters: {
              showAlert: jest.fn(),
            },
            utils: {
              authenticator: {
                isAuthenticated: () => false,
              },
            },
          },
          handlePasswordResetDialog: jest.fn(),
        };
        component = shallow(<TestProjectOwnerLoginForm {...props} />).dive();
      });

      describe('sign up button', () => {
        it('should exist', () => {
          const signUpButton = component.find(Button).filterWhere(button => button.props().to === '/signup');

          expect(signUpButton.exists()).toBeTruthy();
        });
      });

      describe('Forgot password button', () => {
        it('should exist', () => {
          const forgotPasswordButton = component.find(Button).at(1);

          expect(forgotPasswordButton.exists()).toBeTruthy();
        });

        it('should open the reset password dialog when clicked', () => {
          let dialog = component.find(PasswordResetDialog);
          expect(dialog.prop('open')).toEqual(false);

          const forgotPasswordButton = component.find(Button).at(1);
          forgotPasswordButton.simulate('click');

          expect(component.state().passwordResetDialogOpen).toEqual(true);

          dialog = component.find(PasswordResetDialog);
          expect(dialog.prop('open')).toEqual(true);
        });
      });
      it('should redirect to project owner dashboard when should redirect is true', () => {
        component.setState({
          shouldRedirect: true,
        });

        expect(component.find(Redirect).props().to).toEqual('/project_owner/dashboard');
      });
    });

    describe('form validations', () => {
      let props;
      let component;

      beforeEach(() => {
        props = {
          classes: {},
          context: {
            updaters: {
              showAlert: jest.fn(),

            },
            utils: {
              authenticator: {
                isAuthenticated: () => false,
              },
            },
          },
          handlePasswordResetDialog: jest.fn(),
        };
        component = shallow(<TestProjectOwnerLoginForm {...props} />);
      });

      it('should show invalid email message when login with invalid email', async () => {
        const emailTextField = component.dive().find(TextField).filterWhere(n => n.props().name === 'email');
        expect(emailTextField.exists()).toBeTruthy();

        const event = {
          target: { name: 'email', value: 'invalid email' },
        };

        await component.instance().handleChange(event);
        component.update();
        const emailTextFieldNew = component.dive().find(TextField)
          .filterWhere(n => n.props().name === 'email');
        expect(emailTextFieldNew.props().error).toBeTruthy();
        expect(emailTextFieldNew.props().helperText).toBeTruthy();
      });

    });

    describe('handling submission', () => {
      describe('when login is successful', () => {
        let props;
        let component;
        const valuesForAllFields = {
          email: 'test@test.com',
          password: 'test123',
        };

        beforeEach(() => {
          props = {
            classes: {},
            context: {
              updaters: {
                showAlert: jest.fn(),
              },
              utils: {
                authenticator: {
                  loginProjectOwner: jest.fn(() => {
                    return new Promise(resolve => resolve({
                      isSuccessful: true,
                    }));
                  }),
                  isAuthenticated: () => false,
                },
              },
            },
            valuesForAllFields: jest.fn(() => {
              return valuesForAllFields;
            }),
            validateAllFields: jest.fn(() => {
              return true;
            }),
          };

          component = shallow(<TestProjectOwnerLoginForm {...props} />);
        });

        it('should prevent default when handleSubmit is clicked', async () => {

          const event = {
            preventDefault: jest.fn(),
          };
          component.dive().instance().handleSubmit(event);

          expect(event.preventDefault).toHaveBeenCalled();
          expect(component.props().validateAllFields).toHaveBeenCalled();
          expect(component.props().validateAllFields()).toBeTruthy();
        });

        it('should invoke authenticator when handleSubmit is clicked', async () => {

          const event = {
            preventDefault: jest.fn(),
          };
          component.dive().instance().handleSubmit(event);

          const { email, password } = valuesForAllFields;

          expect(component.props().context.utils.authenticator.loginProjectOwner).toHaveBeenCalledWith(email, password);
          expect(await component.props().context.utils.authenticator.loginProjectOwner(email, password)).toEqual({ isSuccessful: true });
        });

        it('should show success alert when authentication successful', async () => {

          const event = {
            preventDefault: jest.fn(),
          };
          component.dive().instance().handleSubmit(event);

          const { email, password } = valuesForAllFields;
          await component.props().context.utils.authenticator.loginProjectOwner(email, password);

          expect(component.props().context.updaters.showAlert).toHaveBeenCalledWith('loginSuccess', AlertType.SUCCESS, LOGIN_SUCCESS_MESSAGE);
        });
      });

      describe('when login is unsuccessful', () => {
        let props;
        let component;
        const valuesForAllFields = {
          email: 'test@test.com',
          password: 'test123',
        };
        const response = {
          isSuccessful: false,
          hasError: true,
          status: 401,
        };

        beforeEach(() => {
          props = {
            classes: {},
            context: {
              updaters: {
                showAlert: jest.fn(),
              },
              utils: {
                authenticator: {
                  loginProjectOwner: jest.fn(() => {
                    return new Promise(resolve => resolve(response));
                  }),
                  isAuthenticated: () => false,
                },
              },
            },
            valuesForAllFields: jest.fn(() => {
              return valuesForAllFields;
            }),
            validateAllFields: jest.fn(() => {
              return true;
            }),
          };

          component = shallow(<TestProjectOwnerLoginForm {...props} />);
        });

        it('should invoke authenticator when handleSubmit is clicked', async () => {

          const event = {
            preventDefault: jest.fn(),
          };
          component.dive().instance().handleSubmit(event);

          const { email, password } = valuesForAllFields;

          expect(component.props().context.utils.authenticator.loginProjectOwner).toHaveBeenCalledWith(email, password);
          expect(await component.props().context.utils.authenticator.loginProjectOwner(email, password)).toEqual(response);
        });

        it('should show failure alert when authentication failed', async () => {

          const event = {
            preventDefault: jest.fn(),
          };
          component.dive().instance().handleSubmit(event);

          const { email, password } = valuesForAllFields;
          await component.props().context.utils.authenticator.loginProjectOwner(email, password);

          expect(component.props().context.updaters.showAlert).toHaveBeenCalledWith('loginFailure', AlertType.ERROR, LOGIN_FAILURE_MESSAGE);
        });
      });
    });
  });

  describe('when project owner is already logged in', () => {
    let mockContext;
    let component;

    beforeEach(() => {
      mockContext = { ...defaultAppContext, isAuthenticated: true };
      mockContext.utils.authenticator = {
        isAuthenticated: () => true,
        getCurrentUser: jest.fn(() => ({
          role: Role.PROJECT_OWNER,
          email: 'projectowner@email.com',
        })),
        logoutProjectOwner: jest.fn(() => Promise.resolve({})),
      };

      const props = {
        classes: {},
        context: mockContext,
        handlePasswordResetDialog: jest.fn(),
      };

      component = shallow(<TestProjectOwnerLoginForm {...props} />).dive();
    });

    describe('render', () => {
      it('should show the current logged in user, a button to logout and a button to go to the dashboard', () => {
        expect(component.find(Typography).html()).toEqual(
          expect.stringContaining('logged in as projectowner@email.com')
        );
        expect(component.find(Button).get(0).props.children).toContain('Logout');
        expect(component.find(Button).get(1).props.to).toEqual('/project_owner/dashboard');
      });
    });

    describe('logging out', () => {
      it('should log out project owner when logout button is clicked', async () => {
        await component.find(Button).at(0).simulate('click');

        expect(mockContext.utils.authenticator.logoutProjectOwner).toHaveBeenCalled();
      });
    });
  });
});