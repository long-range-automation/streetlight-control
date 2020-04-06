import axios from 'axios';
import * as express from 'express';

const config = require('../settings-development.json');

const API_URL = 'http://localhost:3000/hooks/chirp';
const HOOK_PORT = 4080;
const PROTOCOL_VERSION = 0;
const LOCATION_TYPE = 0;
const HEARTBEAT_TYPE = 1;
const CONFIGURATION_TYPE = 2;
const TX_INTERVAL = 60;
const MAX_TIME_BYTE = 239;
const RELAY_MODE_AUTO = 2;

axios.defaults.headers.common['Authorization'] = config.chirp.uplinkSecret;

const DEFAULT_DATA = {
    applicationID: "1",
    applicationName: "test",
    deviceName: "",
    devEUI: "",
    txInfo: {},
    adr: true,
    fCnt: 7,
    fPort: 1,
    data: "",
};

class GPS {
    private latitude = Math.random() * 180 - 90;
    private longitude = Math.random() * 360 - 180;

    constructor(private signal: boolean) {

    }

    public hasSignal() {
        return this.signal;
    }

    public getPosition() {
        return {
            latitude: this.signal ? this.latitude : 0xffffff,
            longitude: this.signal ? this.longitude : 0xffffff,
        }
    }

    public getTime() {
        let date = new Date();

        return {
            hour: this.signal ? date.getUTCHours() : 0xff,
            minute: this.signal ? date.getUTCMinutes() : 0xff,
        }
    }
}

function timeToByte(input: { hour, minute }) {
    return ((input.hour % 24) * 10) + (Math.floor(input.minute / 6));
}

function isInRange(start: number, ende: number, value: number): boolean {
    return (value > start && value <= MAX_TIME_BYTE && ende < start) ||
        (value < ende && value >= 0 && ende < start) ||
        (value > start && value < ende);
}

function packLocationMessage(gps: GPS) {
    let position = gps.getPosition();

    let lat = gps.hasSignal() ? (position.latitude + 180) * 10000 : 0xffffff;
    let lon = gps.hasSignal() ? (position.longitude + 180) * 10000 : 0xffffff;
    let data = [];

    data[0] = (PROTOCOL_VERSION << 4) + LOCATION_TYPE;
    data[1] = Math.floor(TX_INTERVAL / 60);
    data[2] = lat >> 16;
    data[3] = lat >> 8;
    data[4] = lat;
    data[5] = lon >> 16;
    data[6] = lon >> 8;
    data[7] = lon;

    return Buffer.from(data).toString('base64');
}

function packHeartbeatMessage(gps: GPS, relayState: (0 | 1)[], schedule, relayModes: number) {
    let maintenanceMode = 0;
    let gpsSignal = gps.hasSignal() ? 1 << 6 : 0;
    let relayStates = relayState[0] + (relayState[1] << 1) + (relayState[2] << 2) + (relayState[3] << 3);
    let time = gps.getTime();

    let data = [];

    data[0] = (PROTOCOL_VERSION << 4) + HEARTBEAT_TYPE;
    data[1] = schedule.timeOn ^ schedule.timeOff ^ schedule.outageOn ^ schedule.outageOff;
    data[2] = time.hour; //hour
    data[3] = time.minute; //minute
    data[4] = Math.floor(TX_INTERVAL / 60);
    data[5] = maintenanceMode + gpsSignal + relayStates;
    data[6] = relayModes;

    return Buffer.from(data).toString('base64');
}

class Device {
    private config = {
        relayModes: 0,
        schedule: {
            timeOn: 0xff,
            timeOff: 0xff,
            outageOn: 0xff,
            outageOff: 0xff,
        },
    }

    private relayStates: (0 | 1)[] = [0, 0, 0, 0];

    private counter = 0;

    private scheduledDownlinkMessage: string;

    constructor(private deviceId: string, private gps: GPS, private faulty: boolean) {
        console.log(`New device [${deviceId}][${gps.hasSignal()?'signal':'no gps'}]${faulty?'[Faulty]':''}`);
    }

    public sendUplinkMessage() {
        this.checkAutomation();

        let data = {
            ...DEFAULT_DATA,
            devEUI: this.deviceId,
            deviceName: this.deviceId,
            fCnt: this.counter,
            data: this.counter % 5 ?
                packHeartbeatMessage(this.gps, this.relayStates, this.config.schedule, this.config.relayModes) :
                packLocationMessage(this.gps),
        };

        // data.metadata.gateways[0].time = (new Date()).toISOString();
        // data.metadata.gateways[0].timestamp = (new Date()).getTime();
        // data.metadata.time = (new Date()).toISOString();
        // data.downlink_url = `http://localhost:${HOOK_PORT}/${HOOK_PATH}`;

        axios.post(API_URL, data).then(response => {
            console.log(`> UPLINK (${this.deviceId}): ${response.status} ${response.data}`);

            this.counter++;
        }).catch(err => {
            console.log(`> UPLINK ERROR (${this.deviceId}): ${err.toString()} ${err.data}`);
        }).then(() => {
            let waitTime = TX_INTERVAL * 1000;

            if (this.scheduledDownlinkMessage) {
                this.onDownlinkMessage(this.scheduledDownlinkMessage);

                this.scheduledDownlinkMessage = undefined;
                waitTime = 5000;
            }

            if (!this.faulty) {
                setTimeout(() => {
                    this.sendUplinkMessage();
                }, waitTime);
            }
        });
    }

    public scheduleDownlinkMessage(raw: string) {
        console.log(`< DOWNLINK (${this.deviceId}): message scheduled`);

        this.scheduledDownlinkMessage = raw;
    }

    private onDownlinkMessage(raw: string) {
        let data = Buffer.from(raw, 'base64');

        let protocolVersion = data[0] >> 4;
        let messageType = data[0] & 0xff;

        console.log(`< DOWNLINK (${this.deviceId}): VERSION=${protocolVersion} TYPE=${messageType}`);

        if (messageType === CONFIGURATION_TYPE) {
            this.config.relayModes = data[1];
            this.config.schedule.timeOn = data[2];
            this.config.schedule.timeOff = data[3];
            this.config.schedule.outageOn = data[4];
            this.config.schedule.outageOff = data[5];

            this.updateRelays();
        }
    }

    private updateRelays() {
        for (let i = 0; i < this.relayStates.length; i++) {
            let mode = (this.config.relayModes >> (2 * i)) & 0x3;

            if (mode === 0 || mode === 1) {
                this.relayStates[i] = mode;
            }
        }
    }

    private checkAutomation() {
        let time = this.gps.getTime();

        if (time.hour === 0xff) {
            console.log('Abort automation, because we have no valid time');

            return;
        }

        let timeByte = timeToByte(time);
        let isInOnRange = false;
        let { schedule } = this.config;

        if (schedule.timeOn != schedule.timeOff) {
            if (schedule.outageOn != schedule.outageOff) {
                isInOnRange = isInRange(schedule.timeOn, schedule.outageOn, timeByte) ||
                    isInRange(schedule.outageOff, schedule.timeOff, timeByte);
            }
            else {
                isInOnRange = isInRange(schedule.timeOn, schedule.timeOff, timeByte);
            }
        }

        for (let i = 0; i < 4; i++) {
            if (((this.config.relayModes >> (2 * i)) & 0x3) != RELAY_MODE_AUTO) {
                // console.log(`Skip relay ${i}, because it's not in auto mode`);
                continue;
            }

            // console.log(`Relay ${i} is ${!isInOnRange ? 'NOT ' : ''}in range`);

            if (isInOnRange) {
                this.relayStates[i] = 1;
            }
            else {
                this.relayStates[i] = 0;
            }
        }
    }
}

let deviceIds = [
    // 'otaa-gps-device',
    'Ta3tL35y9Dc6Lca65',
]
let devices = deviceIds.reduce((previous, id) => {
    // previous[id] = new Device(id, new GPS(Math.random() < 0.5), Math.random() < 0.5);
    previous[id] = new Device(id, new GPS(true), false);

    return previous;
}, {});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.delete('/api/devices/:deviceId/queue', (req, res) => {
    console.log('Delete queue for ' + req.params.deviceId);

    res.send();
});
app.post('/api/devices/:deviceId/queue', (req, res) => {
    let deviceId = req.params.deviceId;
    let data = req.body

    if (deviceId && devices[deviceId]) {
        devices[deviceId].scheduleDownlinkMessage(data.deviceQueueItem.data);
    } else {
        console.log('Downlink request error', data);
    }

    res.send();
})

app.listen(HOOK_PORT, () => {
    console.log(`Device simulator listening on port ${HOOK_PORT}!`);

    deviceIds.forEach(id => {
        devices[id].sendUplinkMessage();
    });
});