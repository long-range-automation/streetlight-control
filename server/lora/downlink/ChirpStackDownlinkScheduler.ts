import axios from 'axios';
import { buildConfigurationMessage } from "./MessageBuilder";
import { DownlinkScheduler } from "./DownlinkScheduler";
import { Meteor } from "meteor/meteor";
import { DeviceCollection } from "/imports/api/devices";

let chirpJWToken: string = '';

export default class ChirpStackDownlinkScheduler extends DownlinkScheduler {
    public async schedule(numberOfTrials = 0): Promise<boolean> {
        let deviceId = this.deviceId;
        let device = DeviceCollection.findOne(deviceId);

        if (!device) {
            console.warn(`Found no device with id ${deviceId}`);

            return false;
        }

        let payload = {
            deviceQueueItem: {
                confirmed: false,
                data: buildConfigurationMessage(device),
                devEUI: device._id,
                //   fCnt: 0,
                fPort: 1,
                jsonObject: ''
            }
        };

        let apiUrl = Meteor.settings.chirp.url;

        if (!apiUrl) {
            console.warn('Found no chirp url');

            return false;
        }

        let requestConfig = {
            headers: {
                'Grpc-Metadata-Authorization': `Bearer ${chirpJWToken}`,
            },
        };

        try {
            await axios.delete(`${apiUrl}/api/devices/${device._id}/queue`, requestConfig);
            await axios.post(`${apiUrl}/api/devices/${device._id}/queue`, payload, requestConfig);

            console.info(`Downlink message transferred`, { deviceId });
        } catch (error) {
            if (error.response && error.response.status === 401 && numberOfTrials === 0) {
                // refresh token
                let token = chirpJWToken = await this.login();

                if (token) {
                    return await this.schedule(numberOfTrials + 1);
                }
                else {
                    console.warn(`Can not schedule downlink message without valid credentials.`);
                }
            }
            else if (error.response && error.response.status === 403) {
                console.warn(`Could not schedule downlink message, because access was forbidden.`);
            }
            else {
                console.warn(`Could not schedule downlink message: ${error.toString()}`, { error });
            }

            return false;
        }
        return true;
    }

    private async login(): Promise<string> {
        let apiUrl = Meteor.settings.chirp.url;
        let username = Meteor.settings.chirp.username;
        let password = Meteor.settings.chirp.password;

        try {
            let request = await axios.post(`${apiUrl}/api/internal/login`, { username, password });

            console.info(`JWT for lora server retrieved.`);

            return request.data.jwt;
        } catch (error) {
            if (error.response) {
                console.warn(`Unable to authenticate at lora server`);
            } else {
                console.warn(`Error while requesting JWT: ${error.toString()}`);
            }

            return '';
        }
    }
}
