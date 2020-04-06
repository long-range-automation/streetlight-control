import { UplinkMessage } from "./UplinkMessage";
import { LOCATION_MESSAGE_LENGTH, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_INTERNAL_ERROR } from "/imports/Const";
import { APIError } from "./APIError";
import { parseLocationMessage } from "./MessageParser";
import { DeviceCollection } from "/imports/api/devices";
import { AreaCollection } from "/imports/api/areas";

export class UplinkLocationMessage {
    constructor(private message: UplinkMessage) {

    }

    public async processMessage() {
        let data = this.message.getData();

        if (data.length !== LOCATION_MESSAGE_LENGTH) {
            throw new APIError(HTTP_BAD_REQUEST, `Message corrupted`);
        }

        let deviceId = this.message.getDeviceId();
        let currentDevice = DeviceCollection.findOne(deviceId);

        if (!currentDevice) {
            console.info(`Location message received from unknown device. Ignore.`, {deviceId});

            throw new APIError(HTTP_NOT_FOUND, `Device not found (${deviceId})`);
        }

        let area = AreaCollection.findOne(currentDevice.areaId);

        if (!area) {
            //@REVIEW important?
            throw new APIError(HTTP_INTERNAL_ERROR, 'No area configured');
        }

        let locationMessage = parseLocationMessage(data.slice(1));

        console.log(`Location message received. LAT=${locationMessage.latitude}; LON=${locationMessage.longitude}`, { deviceId, ...locationMessage });

        let lastSeen = this.message.getDate();

        let document = {
            lastSeen: lastSeen.toISOString(),
            nextWindowOffset: locationMessage.nextWindow,
            nextWindow: (new Date(lastSeen.getTime() + (locationMessage.nextWindow * 60 * 1000))).toISOString(),
            latitude: locationMessage.latitude,
            longitude: locationMessage.longitude,
        };

        DeviceCollection.update(deviceId, {
            $set: document,
        }); //@TODO need to wait?
    }
}
