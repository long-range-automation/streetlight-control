import { Meteor } from 'meteor/meteor';
import { AreaCollection } from '/imports/api/areas';
import { WebApp } from 'meteor/webapp';
import Lora from './lora';
import { getScheduleChecksum, getTimeFormated } from '/imports/Utils';
import * as suncalc from 'suncalc'
import { DeviceCollection } from '/imports/api/devices';

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

  if (AreaCollection.find().count() === 0) {
    AreaCollection.insert({
      name: 'Gebiet 1',
      schedule: {
        timeOn: '',
        timeOff: '',
        outageOn: '',
        outageOff: '',
      },
      latitude: 47.694628,
      longitude: 9.272657,
    });
  }
});
