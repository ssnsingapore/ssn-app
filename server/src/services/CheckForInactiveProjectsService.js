import { Project, ProjectState, ProjectType } from 'models/Project';

const getDateToday = () => new Date(new Date().setHours(0, 0, 0, 0));

const getProjectsWithPastEndDates = () => Project.find({
  projectType: ProjectType.EVENT,
  state: ProjectState.APPROVED_ACTIVE,
  endDate: { $lt: getDateToday() },
});

const writeToLog = (results) => {
  console.log('Inactive Project Service: Job has completed');
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
    console.log(
      'Inactive Project Service: Running job to check for inactive projects'
    );
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
