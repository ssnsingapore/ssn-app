const wordsToNotCapitalize = [
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'en',
  'for',
  'if',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'v',
  'v.',
  'via',
  'vs',
  'vs.',
];

export const capitalizeWords = (string) => {
  return string.toLowerCase().split` `.map(word => {
    if (wordsToNotCapitalize.includes(word)) {
      return word;
    }

    return word.charAt(0).toUpperCase() + word.substring(1);
  }).join(' ');
};
