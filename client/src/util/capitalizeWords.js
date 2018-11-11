const wordsToNotCapitalize = ['the', 'and'];

export const capitalizeWords = (string) => {
  return string.toLowerCase().split` `.map(word => {
    if (wordsToNotCapitalize.includes(word)) {
      return word;
    }

    return word.charAt(0).toUpperCase() + word.substring(1);
  }).join(' ');
};