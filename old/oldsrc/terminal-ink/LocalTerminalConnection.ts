
import { Snapshot } from '../..'
import TerminalConnection from './TerminalConnection'

export default class LocalTerminalConnection implements TerminalConnection {
    snapshot: Snapshot

    constructor(snapshot: Snapshot) {
        this.snapshot = snapshot;
    }

    async start() {
    }

    async submitQuery(cmd: string) {
        await this.snapshot.submitQuery(cmd);
    }
}
