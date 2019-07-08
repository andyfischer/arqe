
import Fs from 'fs-extra'
import Path from 'path'
import Store from './Store'
import { Snapshot } from '../framework'

export default class FileStore  {
    dir: string
    eventLogPath: string
    eventLogStream: any
    listeningSnapshots: Snapshot[] = []

    constructor(dir: string) {
        this.dir = dir;
        this.eventLogPath = Path.join(dir, 'event.log');
    }

    async initializeFiles() {
        await Fs.mkdir(this.dir);
        await Fs.writeFile(Path.join(this.dir, 'objectspace-store-v1'), ' ');
        await Fs.writeFile(Path.join(this.eventLogPath), '');
    }

    async *readEveryEventString() {
        const file = await Fs.readFile(this.eventLogPath, 'utf8');
        const lines = file.split('\n');
        for (const line of lines) {
            yield line;
        }
    }

    async filesExist() {
        if (!await Fs.exists(this.dir))
            return false;

        if (!await Fs.exists(Path.join(this.dir, 'objectspace-store-v1')))
            return false;

        return true;
    }

    async saveEvent(data) {
        /*
        if (!this.eventLogStream)
            this.eventLogStream = Fs.createWriteStream(this.eventLogPath, {flags: 'a'});

        await this.eventLogStream.write(JSON.stringify(data) + '\n');

        for (const snapshot of this.listeningSnapshots) {
            snapshot.updateToLatestEvent(event);
        }
        */
    }
}
