import { Meteor } from 'meteor/meteor';
import { AreaCollection } from '/imports/api/areas';
import { WebApp } from 'meteor/webapp';
import Lora from './lora';
import { getScheduleChecksum, getTimeFormated } from '/imports/Utils';
import * as suncalc from 'suncalc'
import { DeviceCollection } from '/imports/api/devices';
import { Accounts } from 'meteor/accounts-base'

console.log('process.argv', process.argv);

if(process.argv[3] === 'user:create') {
  if (process.argv.length !== 8) {
    console.warn('*** user:create username email name password');

    process.exit(20);
  }

  const username = process.argv[4];
  const email = process.argv[5];
  const name = process.argv[6];
  const password = process.argv[7];

  const newUserId = Accounts.createUser({
    username,
    email,
    password,
    profile: {
      name
    },
  });

  console.log(`Created new user with id ${newUserId}.`);

  process.exit(0);
}

WebApp.connectHandlers.use('/hooks/chirp', Lora.onUplink);

function updateSchedules() {
  AreaCollection.find().forEach(area => {
    let sunTimes = suncalc.getTimes(new Date(), area.latitude, area.longitude);
    let schedule = area.schedule;

    if (schedule.timeOn === 'auto') {
      schedule.timeOn = getTimeFormated(sunTimes.sunsetStart);
    }

    if (schedule.timeOff === 'auto') {
      schedule.timeOff = getTimeFormated(sunTimes.sunriseEnd);
    }

    DeviceCollection.update({ areaId: area._id }, {
      $set: {
        schedule,
        targetChecksum: getScheduleChecksum(schedule),
      }
    });
  });
}

Meteor.setInterval(updateSchedules, 24 * 60 * 60 * 1000);

Meteor.startup(() => {
  if (!Meteor.settings.chirp) {
    console.warn('**** Chirp Stack settings missing. See settings-example.json.');

    process.exit(10);
  }

  if (!Meteor.settings.chirp.url) {
    console.warn('**** Chirp Stack url missing');
  }

  if (!Meteor.settings.chirp.username) {
    console.warn('**** Chirp Stack username missing');
  }

  if (!Meteor.settings.chirp.password) {
    console.warn('**** Chirp Stack password missing');
  }

  if (!Meteor.settings.chirp.uplinkSecret) {
    console.warn('**** Chirp Stack uplink secret missing');
  }

  if (!Meteor.settings.chirp.applicationId) {
    console.warn('**** Chirp Stack application id missing');
  }
});
