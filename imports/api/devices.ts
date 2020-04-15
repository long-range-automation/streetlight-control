import { Mongo } from 'meteor/mongo';
import { ScheduleDocument } from './areas';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { METEOR_NOT_AUTHORIZED } from '../Const';

export interface DeviceDocument {
    _id?: string
    name: string
    title: string
    description: string
    areaId: string
    lastSeen: Date
    nextWindowOffset: number
    nextWindow: Date
    isMaintenance: boolean
    hasGPSSignal: boolean
    relayState: number
    relayMode: number
    requestedRelayMode: number
    relayNames: string[]
    schedule: ScheduleDocument
    targetChecksum: number
    remoteChecksum: number
    timeOffset: number
    latitude: number
    longitude: number
}

export const DeviceCollection = new Mongo.Collection<DeviceDocument>('devices');

interface NewDeviceDocument {
    _id: string,
    name: string,
    title: string,
    description: string,
    areaId: string,
    relayNames: string[]
}

interface UpdateDeviceDocument {
    title: string,
    description: string,
    relayNames: string[]
}

Meteor.methods({
    'devices.insert'(
        document: NewDeviceDocument
    ) {
        check(document, {
            _id: String,
            name: String,
            title: String,
            description: String,
            areaId: String,
            relayNames: [String],
        });

        if (!this.userId) {
            throw new Meteor.Error(METEOR_NOT_AUTHORIZED);
        }

        //@TODO check if device exists
        //@TODO check if areaId exists
        //@TODO check if name is unique
        //@TODO check relayNames.length === 4
        //@TODO update schedule

        DeviceCollection.insert({
            ...document,
            lastSeen: new Date(0),
            nextWindowOffset: 0,
            nextWindow: new Date(0),
            isMaintenance: false,
            hasGPSSignal: false,
            relayState: 0,
            relayMode: 0,
            requestedRelayMode: 0,
            schedule: {
                timeOn: '',
                timeOff: '',
                outageOn: '',
                outageOff: '',
            },
            targetChecksum: 0,
            remoteChecksum: 0,
            timeOffset: 0,
            latitude: 0,
            longitude: 0,
        });
    },
    'devices.update'(_id: String, document: UpdateDeviceDocument) {
        check(_id, String);
        check(document, {
            title: String,
            description: String,
            relayNames: [String],
            longitude: Number,
            latitude: Number,
        });

        if (!this.userId) {
            throw new Meteor.Error(METEOR_NOT_AUTHORIZED);
        }

        //@TODO check if device exists
        //@TODO check relayNames.length === 4

        DeviceCollection.update(_id, {
            $set: document,
        });
    },
    'devices.updateRequestedRelayMode'(id: string, requestedRelayMode: number) {
        check(id, String);
        check(requestedRelayMode, Match.Integer);

        if (!this.userId) {
            throw new Meteor.Error(METEOR_NOT_AUTHORIZED);
        }

        //@TODO check if device exists
        //@TODO check range

        DeviceCollection.update(id, {
            $set: { requestedRelayMode },
        });

        Meteor.call('lora.scheduleDownlink', id);
    }
})