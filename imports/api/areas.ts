import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { METEOR_NOT_AUTHORIZED, METEOR_NOT_FOUND } from '../Const';
import { DeviceCollection } from './devices';
import { getScheduleChecksum, getTimeFormated } from '../Utils';
import * as suncalc from 'suncalc'

export interface Schedule {
    timeOn: string
    timeOff: string
    outageOn: string
    outageOff: string
    hasChanged?: boolean
    error?: string
}

export interface Area {
    _id?: string
    name: string
    schedule: Schedule
    latitude: number
    longitude: number
    sunset?: string
    sunrise?: string
}

interface NewAreaDocument {
    name: string,
    latitude: number,
    longitude: number,
}

interface EditAreaDocument extends NewAreaDocument {
}


export const AreaCollection = new Mongo.Collection<Area>('areas');

Meteor.methods({
    'areas.insert'(document: NewAreaDocument) {
        check(document, {
            name: String,
            latitude: Number,
            longitude: Number,
        });

        if (!this.userId) {
            throw new Meteor.Error(METEOR_NOT_AUTHORIZED);
        }

        const _id = AreaCollection.insert({
            ...document,
            schedule: {
                timeOn: 'auto',
                timeOff: 'auto',
                outageOn: '',
                outageOff: '',
            },
        });

        return _id;
    },
    'areas.update'(_id: string, document: EditAreaDocument) {
        check(_id, String);
        check(document, {
            name: String,
            latitude: Number,
            longitude: Number,
        });

        if (!this.userId) {
            throw new Meteor.Error(METEOR_NOT_AUTHORIZED);
        }

        //@TODO check if device exists

        AreaCollection.update(_id, {
            $set: document,
        });
    },
    'areas.updateSchedule'(id: string, schedule: Schedule) {
        check(id, String);
        check(schedule, {
            timeOn: String,
            timeOff: String,
            outageOn: String,
            outageOff: String,
        });

        if (!this.userId) {
            throw new Meteor.Error(METEOR_NOT_AUTHORIZED);
        }

        const area = AreaCollection.findOne(id);

        if (!area) {
            throw new Meteor.Error(METEOR_NOT_FOUND);
        }

        AreaCollection.update(id, {
            $set: { schedule },
        });

        let sunTimes = suncalc.getTimes(new Date(), area.latitude, area.longitude);

        if (schedule.timeOn === 'auto') {
            schedule.timeOn = getTimeFormated(sunTimes.sunsetStart);
        }

        if (schedule.timeOff === 'auto') {
            schedule.timeOff = getTimeFormated(sunTimes.sunriseEnd);
        }

        DeviceCollection.update({ areaId: id }, {
            $set: {
                schedule,
                targetChecksum: getScheduleChecksum(schedule),
            }
        });
    }
})