import { expect } from 'chai';
import 'mocha';
import { buildConfigurationMessage } from './MessageBuilder';
import { timeToByte } from '/imports/Utils';

describe('Message builder', () => {
    describe('Configuration message', () => {
        it('should build a valid message', () => {
            let device = {
                requestedRelayMode: 0x53,
                schedule: {
                    timeOn: '22:00',
                    timeOff: '06:00',
                    outageOn: '00:30',
                    outageOff: '05:00',
                }
            }

            let payload = buildConfigurationMessage(<any> device);

            this.data = Buffer.from(payload, 'base64');

            expect(this.data[0], 'Version and message type').equals(0x2);
            expect(this.data[1], 'Relay state').equals(device.requestedRelayMode);
            expect(this.data[2], 'Time on').equals(timeToByte(device.schedule.timeOn));
            expect(this.data[3], 'Time off').equals(timeToByte(device.schedule.timeOff));
            expect(this.data[4], 'Outage on').equals(timeToByte(device.schedule.outageOn));
            expect(this.data[5], 'Outage off').equals(timeToByte(device.schedule.outageOff));
        });
    })
});