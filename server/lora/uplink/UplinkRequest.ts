
export interface UplinkRequest {
    getRawData(): string
    getDate(): Date
    getApplicationId(): string
    getPortNumber(): number
    getFrameCounter(): number
    getDeviceName(): string
    getDeviceId(): string
}
