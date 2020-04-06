
export abstract class DownlinkScheduler {
    public abstract schedule(): Promise<boolean>;

    constructor(protected deviceId: string) {

    }
}

