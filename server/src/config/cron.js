import cron from 'node-cron';

import { config } from 'config/environment';

export const scheduleCronJob = (service) => {
  console.log(`Scheduling job ${service.constructor.name}`);
  if (!cron.validate(config.CRON_SCHEDULE)) {
    console.log(`Unable to parse cron syntax: ${config.CRON_SCHEDULE}`);
    return;
  }

  cron.schedule(config.CRON_SCHEDULE, () => {
    service.run();
  }, { timezone: 'Asia/Singapore' });
};
