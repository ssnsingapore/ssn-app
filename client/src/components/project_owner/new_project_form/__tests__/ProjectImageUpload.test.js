import React from 'react';
import {
  ProjectImageUpload,
} from 'components/project_owner/new_project_form/ProjectImageUpload';
import {
  Button,
  Dialog,
  DialogContentText,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Fab from '@material-ui/core/Fab';

describe('ProjectImageUpload', () => {
  describe('when there is no image uploaded before', () => {
    let wrapper;

    beforeEach(() => {
      const component = shallow(<ProjectImageUpload/>);
  
      wrapper = component.dive();
    });

    it('should render input for file upload', () => {
      const inputFileUpload = wrapper.find('input');
      expect(inputFileUpload.exists()).toBeTruthy();
      expect(inputFileUpload.props().type).toEqual('file');
    });

    it('should render upload button', () => {
      const uploadButton = wrapper.find(Button);
      expect(uploadButton.props().children[0]).toEqual('Upload Project Image');
    });

    describe('when an image is uploaded', () => {
      let inputFileUpload;
      let mockEvent;
      let imageSrc;

      beforeEach(() => {
        const uploadedFile = 'file';
        imageSrc = 'someFileSrc';
        mockEvent = {
          target: {
            files: [uploadedFile],
          },
        };
        window.URL.createObjectURL = jest.fn(file => {
          if(file === uploadedFile) {
            return imageSrc;
          }
          return '';
        });

        inputFileUpload = wrapper.find('input');
      });

      it('creates image', () => {
        wrapper.instance()._createImage = jest.fn();
        inputFileUpload.simulate('change', mockEvent);
        expect(wrapper.instance()._createImage).toHaveBeenCalledWith(new Image(), imageSrc);
      });
    });
  });

  describe('when there is a previously uploaded image', () => {
    let wrapper;

    beforeEach(() => {
      const component = shallow(<ProjectImageUpload coverImageUrl='some url' />);
  
      wrapper = component.dive();
    });

    it('should render Cancel icon on the selected image', () => {  
      expect(wrapper.find(DeleteIcon).exists()).toBeTruthy();
    });

    it('change input key when image is cancelled so input component will reload and remove file values', () => {
      const cancelButton = wrapper.find(Fab);
      const inputKeyBeforeCancel = wrapper.find('input').key();
  
      cancelButton.simulate('click');

      const inputKeyAfterCancel = wrapper.find('input').key();
  
      expect(inputKeyBeforeCancel).not.toEqual(inputKeyAfterCancel);
    });
  });

  describe('image resolution too low', () => {
    let wrapper;

    beforeEach(() => {
      const component = shallow(<ProjectImageUpload coverImageUrl='some url' />);
  
      wrapper = component.dive();
      
      wrapper.setState({
        imageSrc: 'someFileSrc',
        isImageResolutionTooLow: true,
      });
    });

    it('should open dialog when image selected has low resolution', () => {
      expect(wrapper.find(Dialog).find(DialogContentText).html()).toEqual(
        expect.stringContaining('640 x 480 pixels')
      );
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