import { getFieldNameObject, fieldValue} from '../form';

describe('getFieldNameObject', () => {
  it('returns fields used in the form that can be used like an enum', () => {
    const fieldNameEnum = getFieldNameObject(['name', 'address']);

    expect(fieldNameEnum).toEqual({name: 'name', address: 'address'});
  });
});

describe('fieldValue', () => {
  it('returns value of field given its field name', () => {
    const name = {
      value: 'Amanda',
    };
    const address = {
      value: '1 China Square',
    }; 

    const fields = {
      name,
      address,
    };

    expect(fieldValue(fields, 'name')).toEqual('Amanda');
    expect(fieldValue(fields, 'address')).toEqual('1 China Square');
  });
});