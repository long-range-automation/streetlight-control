import * as http from "http";
import { UplinkMessage } from "./uplink/UplinkMessage";
import { APIError } from "./uplink/APIError";
import { ChirpStackUplinkRequest } from "./uplink/ChirpStackUplinkRequest";
import ChirpStackDownlinkScheduler from "./downlink/ChirpStackDownlinkScheduler";
import { Meteor } from "meteor/meteor";
import { HTTP_FORBIDDEN, HTTP_BAD_REQUEST } from "/imports/Const";

function readBody(request: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = '';

        request.on('data', chunk => body += chunk);
        request.on('end', () => resolve(body));
        request.on('error', () => reject(new APIError(HTTP_BAD_REQUEST, 'Could not read body')));
    })
}

export default class Lora {
    private constructor() {

    }

    public static async onUplink(request: http.IncomingMessage, response: http.ServerResponse) {
        if (request.headers.authorization !== Meteor.settings.chirp.uplinkSecret) {
            let error = new APIError(HTTP_FORBIDDEN, 'Access forbidden');

            error.sendResponse(response);
            return;
        }

        try {
            let rawBody = await readBody(request);
            let payload = JSON.parse(rawBody);
            let uploadRequest = new ChirpStackUplinkRequest(payload)
            let uplinkMessage = UplinkMessage.process(uploadRequest);

            await uplinkMessage.processMessage();
            response.end();
        } catch (error) {
            if (error instanceof APIError) {
                console.warn(`API Error: ${error.toString()}`);

                error.sendResponse(response);
            } else {
                console.warn(`Error while processing uplink message: ${error.toString()}`, { error });

                throw error;
            }
        }

    }

    public static async scheduleDownlink(deviceId: string) {
        console.log('Schedule downlink for ' + deviceId);

        let downlinkRequest = new ChirpStackDownlinkScheduler(deviceId);

        return downlinkRequest.schedule();
    }
}

Meteor.methods({
    'lora.scheduleDownlink'(deviceId: string) {
        Lora.scheduleDownlink(deviceId);
    }
})