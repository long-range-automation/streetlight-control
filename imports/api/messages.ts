export interface LocationMessage {
    nextWindow: number
    latitude: number
    longitude: number
}

export interface HeartbeatMessage {
    checksum: number
    hour: number
    minute: number
    nextWindow: number
    isMaintenanceMode: boolean
    hasGPSSignal: boolean
    relay0: boolean
    relay1: boolean
    relay2: boolean
    relay3: boolean
    relayMode: number
}