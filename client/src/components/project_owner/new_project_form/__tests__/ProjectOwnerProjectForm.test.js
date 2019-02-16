import React from 'react';
import { Button } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { _ProjectOwnerProjectForm } from '../ProjectOwnerProjectForm';

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

  describe('togglePreviewOn', () => {
    let project;

    beforeEach(() => {
      project = {
        title : 'Some Project',
        description : 'Some Description',
        coverImageUrl : 'Some Url',
      };
      const mockProjectFields = {
        title: {
          value: project.title,
          errors: [],
        },
        description: {
          value: project.description,
          errors: [],
        },
      };
      const mockImageInputRef = {
        current: {
          state: {
            imageSrc: project.coverImageUrl,
          },
        },
      };

      component.setProps({
        fields: mockProjectFields,
        projectImageInput: mockImageInputRef,
        volunteerRequirementRefs: {},
      });
    });

    it('sets correct project values to state', () => {
      component.instance().togglePreviewOn();

      expect(component.state().project).toEqual({
        ...project,
        volunteerRequirements: [],
      });
    });

    it('sets preview to true', () => {
      component.instance().togglePreviewOn();
      
      expect(component.state().preview).toBe(true);
    });
  });
});
