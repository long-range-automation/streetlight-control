import {ServerResponse} from 'http';

export class APIError {
    constructor(private httpStatusCode: number, private message: string) {

    }

    public sendResponse(response: ServerResponse) {
        response.statusCode = this.httpStatusCode;
        response.end(JSON.stringify({ error: this.message }));
    }

    public toString() {
        return `#${this.httpStatusCode} ${this.message}`;
    }
}
