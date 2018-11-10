import React from 'react';
import {
  ProjectImageUpload,
} from 'components/project_owner/new_project_form/ProjectImageUpload';
import {
  Button,
  IconButton,
  Dialog,
} from '@material-ui/core';

describe('ProjectImageUpload', () => {
  let component, props, wrapper;

  beforeAll(() => {
    props = {
      projectImageInput: {
        current: {
          value: 'notEmpty',
          files: ['someFileName.png'],
        },
      },
    };
    component = shallow( < ProjectImageUpload { ...props
      }
    />);

    wrapper = component.dive();
  });

  it('should render input for file upload', () => {
    const inputFileUpload = wrapper.find('input');
    expect(inputFileUpload.exists()).toBeTruthy();
    expect(inputFileUpload.props().type).toEqual('file');
  });

  it('should render upload button if image is not selected', () => {
    const uploadButton = wrapper.find(Button);
    expect(uploadButton.props().children[0]).toEqual('Upload Project Image');
  });

  it('should change state to non-null imageSrc upon selecting image', () => {

    expect(wrapper.state().imageSrc).toEqual('');

    window.URL.createObjectURL = jest.fn((() => 'someFileSrc'));

    const inputFileUpload = wrapper.find('input');
    inputFileUpload.simulate('change');

    expect(wrapper.state().imageSrc).toEqual('someFileSrc');

  });

  it('should render Cancel icon on the selected image', () => {
    window.URL.createObjectURL = jest.fn((() => 'someFileSrc'));

    const inputFileUpload = wrapper.find('input');
    inputFileUpload.simulate('change');

    expect(wrapper.find(IconButton).exists()).toBeTruthy();
  });

  it('should remove current value when click cancel', () => {
    const cancelButton = wrapper.find(IconButton);
    expect(component.prop('projectImageInput').current.value).not.toEqual('');
    expect(wrapper.state().imageSrc).not.toEqual('');

    cancelButton.simulate('click');

    expect(component.prop('projectImageInput').current.value).toEqual('');
    expect(wrapper.state().imageSrc).toEqual('');
  });

  describe('image resolution too low', () => {
    beforeAll(() => {
      wrapper.setState({
        imageSrc: 'someFileSrc',
        isImageResolutionTooLow: true,
      });
    });

    it('should open dialog when image selected has low resolution', () => {

      expect(wrapper.find(Dialog).exists()).toBeTruthy();
    });

    it('should reset state after closing dialog', () => {
      const dialogComponent = wrapper.find(Dialog);
      const okButton = dialogComponent.find(Button);
      okButton.simulate('click');
      expect(wrapper.state().imageSrc).toBe('');
      expect(wrapper.state().isImageResolutionTooLow).toBe(false);
    });
  });


});