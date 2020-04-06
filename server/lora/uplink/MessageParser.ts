import { LOCATION_MESSAGE_LENGTH, HEARTBEAT_MESSAGE_LENGTH } from "/imports/Const";
import { LocationMessage, HeartbeatMessage } from "/imports/api/messages";

export function parseLocationMessage(data: Buffer): LocationMessage {
    if (data.length !== (LOCATION_MESSAGE_LENGTH - 1)) {
        throw new Error(`Can not parse location message of size ${data.length}.`);
    }

    let nextWindow = data[0];
    let latitude = ((data[1] << 16) + (data[2] << 8) + data[3]) / 10000 - 180;
    let longitude = ((data[4] << 16) + (data[5] << 8) + data[6]) / 10000 - 180;

    return {
        nextWindow,
        latitude: Math.floor(latitude * 10000) / 10000,
        longitude: Math.floor(longitude * 10000) / 10000,
    }
}

const RELAY_MASK = 0xf;
const MAINTENANCE_MASK = 0x8;
const GPS_MASK = 0x4;
const RELAY0_MASK = 0x1;
const RELAY1_MASK = 0x2;
const RELAY2_MASK = 0x4;
const RELAY3_MASK = 0x8;

export function parseHeartbeatMessage(data: Buffer): HeartbeatMessage {
    if (data.length !== (HEARTBEAT_MESSAGE_LENGTH - 1)) {
        throw new Error(`Can not parse heartbeat message of size ${data.length}.`);
    }

    let checksum = data[0];
    let hour = data[1];
    let minute = data[2];
    let nextWindow = data[3];
    let deviceState = data[4] >> 4;
    let relayState = data[4] & RELAY_MASK;
    let relayMode = data[5];

    let isMaintenanceMode = (deviceState & MAINTENANCE_MASK) === MAINTENANCE_MASK;
    let hasGPSSignal = (deviceState & GPS_MASK) === GPS_MASK;
    let relay0 = (relayState & RELAY0_MASK) === RELAY0_MASK;
    let relay1 = (relayState & RELAY1_MASK) === RELAY1_MASK;
    let relay2 = (relayState & RELAY2_MASK) === RELAY2_MASK;
    let relay3 = (relayState & RELAY3_MASK) === RELAY3_MASK;

    return {
        checksum,
        hour,
        minute,
        nextWindow,
        isMaintenanceMode,
        hasGPSSignal,
        relay0,
        relay1,
        relay2,
        relay3,
        relayMode,
    };
}