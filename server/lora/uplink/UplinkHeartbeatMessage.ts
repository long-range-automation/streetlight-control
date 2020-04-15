import { APIError } from "./APIError";
import { HEARTBEAT_MESSAGE_LENGTH, HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "/imports/Const";
import Lora from "..";
import { parseHeartbeatMessage } from './MessageParser';
import { UplinkMessage } from "./UplinkMessage";
import { DeviceCollection } from "/imports/api/devices";
import { AreaCollection } from "/imports/api/areas";
import { relayStatesToNumber } from "/imports/Utils";

export class UplinkHeartbeatMessage {
    private static checksumErrorCounter: { [id: string]: number } = {};

    constructor(private message: UplinkMessage) {

    }

    public async processMessage() {
        let data = this.message.getData();

        if (data.length !== HEARTBEAT_MESSAGE_LENGTH) {
            throw new APIError(HTTP_BAD_REQUEST, `Message corrupted`);
        }

        let deviceId = this.message.getDeviceId();
        let currentDevice = DeviceCollection.findOne(deviceId);

        if (!currentDevice) {
            console.info(`Unknown device. Ignore.`, {deviceId});

            throw new APIError(HTTP_NOT_FOUND, `Device not found (${deviceId})`);
        }

        let area = AreaCollection.findOne(currentDevice.areaId);

        if (!area) {
            throw new APIError(HTTP_INTERNAL_ERROR, 'No area configured');
        }

        let heartbeatMessage = parseHeartbeatMessage(data.slice(1));
        let lastSeen = this.message.getDate();

        let document = {
            lastSeen,
            nextWindowOffset: heartbeatMessage.nextWindow,
            nextWindow: (new Date(lastSeen.getTime() + (heartbeatMessage.nextWindow * 60 * 1000))),
            isMaintenance: heartbeatMessage.isMaintenanceMode,
            hasGPSSignal: heartbeatMessage.hasGPSSignal,
            relayState: relayStatesToNumber([heartbeatMessage.relay0, heartbeatMessage.relay1, heartbeatMessage.relay2, heartbeatMessage.relay3]),
            relayMode: heartbeatMessage.relayMode === currentDevice.requestedRelayMode ? currentDevice.requestedRelayMode : currentDevice.relayMode,
            timeOffset: this.getOffset(heartbeatMessage.hour, heartbeatMessage.minute),
            remoteChecksum: heartbeatMessage.checksum,
        };

        DeviceCollection.update(deviceId, {
            $set: document,
        });

        console.log('Heartbeat message received from ' + deviceId, document.remoteChecksum, currentDevice.targetChecksum);

        if (currentDevice.relayState !== document.relayState) {
            console.info(`Relay state change detected. (${currentDevice.relayState} to ${document.relayState})`, {
                deviceId,
                from: currentDevice.relayState,
                to: document.relayState,
            });
        }

        if (typeof UplinkHeartbeatMessage.checksumErrorCounter[deviceId] !== 'number') {
            UplinkHeartbeatMessage.checksumErrorCounter[deviceId] = 0;
        }

        if (currentDevice.schedule && document.remoteChecksum !== currentDevice.targetChecksum) {
            console.info(`Device has an outdated configuration #${UplinkHeartbeatMessage.checksumErrorCounter[deviceId]}`, { deviceId });

            if (UplinkHeartbeatMessage.checksumErrorCounter[deviceId] >= 2) {
                Lora.scheduleDownlink(deviceId);

                UplinkHeartbeatMessage.checksumErrorCounter[deviceId] = 0;
            } else {
                UplinkHeartbeatMessage.checksumErrorCounter[deviceId]++;
            }
        } else {
            UplinkHeartbeatMessage.checksumErrorCounter[deviceId] = 0;
        }
    }

    private getOffset(hour: any, minute: any): number {
        hour = parseInt(hour, 10);
        minute = parseInt(minute, 10);

        if (hour === 0xff || minute === 0xff) {
            return -1;
        }

        let date = new Date();
        let absoluteMinutes = (hour * 60) + minute;
        let currentAbsoluteMinutes = (date.getUTCHours() * 60) + date.getUTCMinutes();
        let diff = Math.max(absoluteMinutes - currentAbsoluteMinutes, currentAbsoluteMinutes - absoluteMinutes);

        return Math.min(diff, (24 * 60) - diff);
    }
}
