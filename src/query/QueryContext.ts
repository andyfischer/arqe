
import { Snapshot } from '../snapshot'

export default class QueryContext {
    snapshot: Snapshot

    responses: string[] = []

    sendResponse(msg: string) {
        this.responses.push(msg);
    }
}
