import { Device } from "/imports/api/devices";
import { SUPPORTED_VERSION, CONFIGURATION_MESSAGE } from "/imports/Const";
import { timeToByte } from "/imports/Utils";

export function buildConfigurationMessage(device: Device): string {
    let data = [];
    let schedule = device.schedule || {
        timeOn: undefined,
        timeOff: undefined,
        outageOn: undefined,
        outageOff: undefined,
    };

    data[0] = (SUPPORTED_VERSION << 4) + CONFIGURATION_MESSAGE;
    data[1] = device.requestedRelayMode;
    data[2] = schedule.timeOn ? timeToByte(schedule.timeOn) : 0xff;
    data[3] = schedule.timeOff ? timeToByte(schedule.timeOff) : 0xff;
    data[4] = schedule.outageOn ? timeToByte(schedule.outageOn) : 0xff;
    data[5] = schedule.outageOff ? timeToByte(schedule.outageOff) : 0xff;

    let rawData = Buffer.from(data);

    return rawData.toString('base64');
}