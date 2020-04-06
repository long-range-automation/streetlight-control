import { expect } from 'chai';
import 'mocha';
import { timeToByte, relayStatesToNumber } from './Utils';

describe('Utils', () => {
    describe('Time to byte', () => {
        it('should convert even values', () => {
            expect(timeToByte('24:00'), '24:00').equals(0);
            expect(timeToByte('24:06'), '24:06').equals(1);
            expect(timeToByte('00:00')).equals(0);
            expect(timeToByte('00:06')).equals(1);
            expect(timeToByte('00:12')).equals(2);
            expect(timeToByte('01:00')).equals(10);
            expect(timeToByte('22:18')).equals(223);
            expect(timeToByte('23:54')).equals(239);
        });

        it('should convert odd values', () => {
            expect(timeToByte('00:01')).equals(0);
            expect(timeToByte('00:05')).equals(0);
            expect(timeToByte('00:13')).equals(2);
            expect(timeToByte('01:01')).equals(10);
            expect(timeToByte('22:19')).equals(223);
            expect(timeToByte('23:59')).equals(239);
        });

        it('should reject invalid inputs', () => {
            expect(timeToByte('0:0')).equals(0xff);
            expect(timeToByte('000:0')).equals(0xff);
            expect(timeToByte('25:00')).equals(0xff);
            expect(timeToByte('30:00')).equals(0xff);
            expect(timeToByte('00:61')).equals(0xff);
        })
    });

    describe('Relay states to byte', () => {
        it('should convert states to byte', () => {
            expect(relayStatesToNumber([true, false, false])).equals(1);
            expect(relayStatesToNumber([true, true])).equals(3);
            expect(relayStatesToNumber([false, true, true, true])).equals(0xe);
            expect(relayStatesToNumber([true, true, true, true])).equals(0xf);
        });
    });
});