import React from 'react';
import { Button } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { _ProjectOwnerProjectForm } from '../ProjectOwnerProjectForm';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { DefaultCoverImageUrl } from 'components/shared/enums/DefaultCoverImageUrl';

describe('ProjectOwnerProjectForm', () => {
  let component;

  beforeEach(() => {
    const mockStyles = {
      root: '',
    };

    const ProjectOwnerProjectForm = withTheme()(
      withStyles(mockStyles)(_ProjectOwnerProjectForm)
    );
    component = shallow(<ProjectOwnerProjectForm />).dive().dive();
  });

  describe('preview mode', () => {
    beforeEach(() => {
      component.setState({
        preview: true,
      });

      component.setProps({
        volunteerRequirementRefs: {
          0: {
            current: {
              valuesForAllFields: jest.fn(),
            },
          },
        },
      });
    });

    it('displays notice that user is viewing a preview', () => {
      expect(
        component.find(Button).at(0).prop('children')
      ).toContain('This is a preview');
    });

    it('renders \'Back to form\' and \'Back to dashboard\' button', () => {
      expect(
        component.find(Button).at(1).prop('children')
      ).toEqual('Back to form');

      expect(
        component.find(Button).at(2).prop('children')
      ).toEqual('Back to dashboard');
    });

    it('does not display submit button', () => {
      const allButtons = component.find(Button).map(button => button.prop('children'));
      expect(allButtons).not.toContain('Submit');
    });

    it('displays only total of 3 buttons', () => {
      expect(component.find(Button)).toHaveLength(3);
    });

    it('should display default image if no cover image is uploaded', () => {
      const mockProject = {
        coverImageUrl: {
          value: '',
        },
        issuesAddressed: {
          value: [IssueAddressed.AIR_QUALITY],
        },
      };

      component.setProps({
        projectImageInput: {
          current: undefined,
        },
        fields: mockProject,
      });

      component.instance().togglePreviewOn();

      expect(component.state().project.coverImageUrl).toEqual(
        DefaultCoverImageUrl[IssueAddressed.AIR_QUALITY]
      );
    });
  });

  describe('edit project mode', () => {
    beforeEach(() => {
      component.setState({
        preview: false,
      });
    });

    it('displays \'Back to dashboard\', \'Preview\' and \'Submit\' button', () => {
      const allButtons = component.find(Button).map(button => button.prop('children'));

      expect(allButtons).toContain('Back to dashboard');
      expect(allButtons).toContain('Preview');
      expect(allButtons).toContain('Submit');
      expect(allButtons).toHaveLength(3);
    });
  });
});
