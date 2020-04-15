import { ScheduleDocument } from "./api/areas";

export function getTimeFormated(rawDate: any) {
    let date = new Date(rawDate);
    let hours = date.getHours();
    let minutes = date.getMinutes();

    return (hours < 10 ? `0${hours}` : hours.toString(10)) + ':' + (minutes < 10 ? `0${minutes}` : minutes.toString(10));
}

export function getScheduleChecksum(schedule: ScheduleDocument) {
    return [
        timeToByte(schedule.timeOn),
        timeToByte(schedule.timeOff),
        timeToByte(schedule.outageOn),
        timeToByte(schedule.outageOff)
    ].reduce((previous, current) => (previous ^ current), 0);
}

export function timeToByte(time: string = '') {
    let matches = time.match(/^([0-1][0-9]|2[0-4]):([0-5][0-9])$/);

    if (!matches || matches.length !== 3 || !matches[1] || !matches[2]) {
        return 0xff;
    }

    let hour = parseInt(matches[1], 10) % 24;
    let minute = parseInt(matches[2], 10);

    return (hour * 10) + Math.floor(minute / 6);
}

export function relayStatesToNumber(relays: boolean[]) {
    return relays.reduce((previous, current, index) => previous + ((current ? 1 : 0) << index), 0);
}
