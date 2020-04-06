type Base64Encoded = string;

interface Gateway {
    gtw_id: string
    timestamp: number
    time: string
    channel: number
    rssi: number
    snr: number
    rf_chain: number
    latitude: number
    longitude: number
    altitude: number
}

export interface TTNPayload {
    app_id: string
    dev_id: string
    hardware_serial: string
    port: number
    counter: number
    is_retry: boolean
    confirmed: boolean
    payload_raw: Base64Encoded
    payload_fields: Object
    metadata: {
        time: string
        frequency: number
        modulation: 'LORA'|'FSK'
        data_rate?: string
        bit_rate?: number
        coding_rate: string
        gateways: Gateway[]
        latitude: number
        longitude: number
        altitude: number
    }
    downlink_url: string
}

export interface ChirpPayload {
    applicationID: string
    applicationName: string
    deviceName: string
    devEUI: string
    txInfo: Object
    adr: boolean
    fCnt: number
    fPort: number
    data: string
}