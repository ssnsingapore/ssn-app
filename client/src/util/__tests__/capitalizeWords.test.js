import { capitalizeWords } from '../capitalizeWords';

describe('capitalizeWords', () => {
  it('capitalizes a word which is in lowercase', () => {
    const word = 'project';

    expect(capitalizeWords(word)).toEqual('Project');
  });

  it('capitalizes first letter of a word and lowercases the rest', () => {
    const badWords = ['PROJECT', 'ProJect', 'PROjecT'];

    badWords.forEach(word => {
      expect(capitalizeWords(word)).toEqual('Project');
    });
  });

  it('capitalizes a string of words', () => {
    const string = 'very long project title';

    expect(capitalizeWords(string)).toEqual('Very Long Project Title');
  });

  it('does not capitalize the word \'the\'', () => {
    const string = 'save the earth';
  
    expect(capitalizeWords(string)).toEqual('Save the Earth');
  });

  it('does not capitalize the word \'and\'', () => {
    const string = 'climate and change';
  
    expect(capitalizeWords(string)).toEqual('Climate and Change');
  });
});