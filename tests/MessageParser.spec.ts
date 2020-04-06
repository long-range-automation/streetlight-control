import { expect } from 'chai';
import 'mocha';
import { parseHeartbeatMessage, parseLocationMessage } from './MessageParser';

function packCoordinates(latitude, longitude) {
    let lat = (latitude + 180) * 10000;
    let lon = (longitude + 180) * 10000;
    let data = [];

    data[0] = lat >> 16;
    data[1] = lat >> 8;
    data[2] = lat;
    data[3] = lon >> 16;
    data[4] = lon >> 8;
    data[5] = lon;

    return data;
}

function getDeviceRelayStateByte(isMaintenanceMode: boolean, hasGPSSignal: boolean, relay0: boolean, relay1: boolean, relay2: boolean, relay3: boolean) {
    return ((isMaintenanceMode ? 1 : 0) << 7) +
        ((hasGPSSignal ? 1 : 0) << 6) +
        (relay0 ? 1 : 0) +
        ((relay1 ? 1 : 0) << 1) +
        ((relay2 ? 1 : 0) << 2) +
        ((relay3 ? 1 : 0) << 3)
}

describe('Message parser', () => {
    describe('Location message', () => {
        it('should parse a valid message', () => {
            let nextWindow = 2;
            let latitude = 9.2569427;
            let longitude = 49.238394;

            let message = Buffer.from([
                nextWindow,
                ...packCoordinates(latitude, longitude),
            ]);

            let locationMessage = parseLocationMessage(message);

            expect(locationMessage.nextWindow, 'next window').equals(nextWindow);
            expect(locationMessage.latitude, 'latitude').to.be.closeTo(latitude, 0.0001);
            expect(locationMessage.longitude, 'longitude').to.be.closeTo(longitude, 0.0001);
        });
    });

    describe('Heartbeat message', () => {
        it('should parse a valid message', () => {
            let checksum = 25;
            let currentDate = new Date();
            let nextWindow = 5;
            let relayMode = 0x53;

            let message = Buffer.from([
                checksum,
                currentDate.getHours(),
                currentDate.getMinutes(),
                nextWindow,
                getDeviceRelayStateByte(true, true, false, true, true, true),
                relayMode,
            ]);

            let heartbeatMessage = parseHeartbeatMessage(message);

            expect(heartbeatMessage.checksum).equals(checksum);
            expect(heartbeatMessage.hour).equals(currentDate.getHours());
            expect(heartbeatMessage.minute).equals(currentDate.getMinutes());
            expect(heartbeatMessage.nextWindow, 'next window').equals(nextWindow);
            expect(heartbeatMessage.isMaintenanceMode, 'maintenance mode').to.be.true;
            expect(heartbeatMessage.hasGPSSignal, 'gps signal').to.be.true;
            expect(heartbeatMessage.relay0, 'relay 0').to.be.false;
            expect(heartbeatMessage.relay1, 'relay 1').to.be.true;
            expect(heartbeatMessage.relay2, 'relay 2').to.be.true;
            expect(heartbeatMessage.relay3, 'relay 3').to.be.true;
            expect(heartbeatMessage.relayMode).equals(relayMode);
        });
    })
});