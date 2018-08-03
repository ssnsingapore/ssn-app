export const checkRequiredExist = (...variables) => {
  variables.forEach((name) => {
    if (!process.env[name]) {
      throw new Error(`Environment variable ${name} is missing`);
    }
  });
};
