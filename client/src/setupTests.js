import { configure, shallow, mount, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';

configure({ adapter: new Adapter() });

global.fetch = require('jest-fetch-mock');

global.shallow = shallow;
global.mount = mount;
global.render = render;