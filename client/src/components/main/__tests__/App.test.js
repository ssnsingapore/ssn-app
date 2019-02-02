import React from 'react';

import App from '../App';
import { AlertType } from 'components/shared/Alert';

jest.mock('util/Authenticator');
jest.mock('react-ga');

describe('App', () => {
  describe('showAlert', () => {
    it('sets alert to be visible with correct type and message', () => {
      const alertKey = 'loginFailure';
      const alertType = AlertType.ERROR;
      const alertMessage = 'Looks like you\'ve keyed in the wrong credentials. Try again!';

      const component = shallow(<App></App>);

      component.instance().showAlert(alertKey, alertType, alertMessage);

      const expectedAlertsState = {
        [alertKey]: {
          isVisible: true,
          type: alertType,
          message: alertMessage,
        },
      };

      expect(component.state().alerts).toEqual(expectedAlertsState);
    });
  });

  describe('hideAlert', () => {
    it('sets alert to not be visible', () => {
      const alertKey = 'loginFailure';
      const alertType = AlertType.ERROR;
      const alertMessage = 'Looks like you\'ve keyed in the wrong credentials. Try again!';

      const component = shallow(<App></App>);

      component.setState({
        alerts: {
          [alertKey]: {
            type: alertType,
            message: alertMessage,
            isVisible: true,
          },
        },
      });

      component.instance().hideAlert(alertKey);

      const expectedAlertsState = {
        [alertKey]: {
          type: alertType,
          message: alertMessage,
          isVisible: false,
        },
      };

      expect(component.state().alerts).toEqual(expectedAlertsState);
    });
  });
});

