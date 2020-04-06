import { UplinkHeartbeatMessage } from "./UplinkHeartbeatMessage";
import { LOCATION_MESSAGE, HEARTBEAT_MESSAGE, HTTP_BAD_REQUEST, MESSAGE_TYPE_MASK, SUPPORTED_VERSION } from "/imports/Const";
import { UplinkLocationMessage } from "./UplinkLocationMessage";
import { APIError } from "./APIError";
import { UplinkRequest } from "./UplinkRequest";
import { Meteor } from "meteor/meteor";

export class UplinkMessage {
    public static process(request: UplinkRequest) {
        let message = new UplinkMessage(request);

        switch (message.getType()) {
            case LOCATION_MESSAGE:
                return new UplinkLocationMessage(message);
            case HEARTBEAT_MESSAGE:
                return new UplinkHeartbeatMessage(message);
            default:
                throw new APIError(HTTP_BAD_REQUEST, `Message type not supported`);
        }
    }

    private data: Buffer;
    private version: number;
    private type: number;

    private constructor(private request: UplinkRequest) {
        if (request.getApplicationId() !== Meteor.settings.chirp.applicationId) {
            throw new APIError(HTTP_BAD_REQUEST, 'Received message for different application');
        }

        if (request.getPortNumber() !== 1) {
            throw new APIError(HTTP_BAD_REQUEST, 'Only messages on port 1 are expected');
        }

        let rawData = request.getRawData();

        if (!rawData) {
            throw new APIError(HTTP_BAD_REQUEST, 'No raw payload provided');
        }

        this.data = Buffer.from(rawData, 'base64');
        this.version = this.data[0] >> 4;
        this.type = this.data[0] & MESSAGE_TYPE_MASK;

        console.log(`Uplink message received`, {
            deviceId: request.getDeviceId(),
            type: this.type,
            counter: request.getFrameCounter(),
        });

        if (this.version !== SUPPORTED_VERSION) {
            throw new APIError(HTTP_BAD_REQUEST, `Only version ${SUPPORTED_VERSION} is supported`);
        }
    }

    public getData() {
        return this.data;
    }

    public getVersion() {
        return this.version;
    }

    public getType() {
        return this.type;
    }

    public getDeviceId() {
        return this.request.getDeviceId();
    }

    public getDate() {
        return this.request.getDate();
    }
}
