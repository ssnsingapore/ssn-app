export const convertToAbsoluteUrl = (inputUrl) => {
  const httpPatternRegex = /^http(s?):\/\//;
  if (!httpPatternRegex.test(inputUrl)) {
    return 'http://' + inputUrl;
  }
  return inputUrl;
};