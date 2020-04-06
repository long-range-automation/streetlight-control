import { ChirpPayload } from './Webhook';
import { UplinkRequest } from "./UplinkRequest";

export class ChirpStackUplinkRequest implements UplinkRequest {
    private date = new Date();

    constructor(private payload: ChirpPayload) {

    }

    public getRawData(): string {
        return this.payload.data;
    }

    public getDate(): Date {
        return this.date;
    }

    public getApplicationId(): string {
        return this.payload.applicationID;
    }

    public getPortNumber(): number {
        return this.payload.fPort;
    }

    public getFrameCounter(): number {
        return this.payload.fCnt;
    }

    public getDeviceName(): string {
        return this.payload.deviceName;
    }

    public getDeviceId(): string {
        return this.payload.devEUI;
    }
}
