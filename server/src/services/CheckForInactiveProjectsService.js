import { Project, ProjectState } from 'models/Project';

const getProjectsWithPastEndDates = () => Project.find({
  state: ProjectState.APPROVED_ACTIVE,
  endDate: { $lt: new Date() },
});

const writeToLog = (results) => {
  results.forEach((result) => {
    if (result instanceof Error) {
      console.log(result);
    } else {
      console.log(
        `Inactive Project Service: Successful update of inactive project ${
          result.id
        }`
      );
    }
  });
};

export class CheckForInactiveProjectsService {
  run = async () => {
    const projectsToUpdate = await getProjectsWithPastEndDates();

    const projects = projectsToUpdate.map(
      project => new Promise((resolve, reject) => {
        project.set({ state: ProjectState.APPROVED_INACTIVE });
        project.save((error, result) => {
          if (error) {
            reject(
              new Error(
                `Inactive Project Service: An error occurred while trying to update project ${
                  project.id
                } to inactive due to Error: ${error}`
              )
            );
          }
          resolve(result);
        });
      })
    );

    // catch rejected promises to return errors for logging
    const updatedProjectsAndErrors = projects.map(project => project.catch(error => error));

    const results = await Promise.all(updatedProjectsAndErrors);

    writeToLog(results);

    return results;
  };
}
