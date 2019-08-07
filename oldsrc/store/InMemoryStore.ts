
/*
import { Snapshot } from '../snapshot'
import { Store, Event } from '.'
import { parseQuery } from '../query'

export default class InMemoryStore {
    everyQuery: string[]
    latestEventId: number = 1
    listeningSnapshots: Snapshot[] = []

    async saveQuery(str: string) {

        this.everyQuery.push(str);

        const parsed = parseQuery(str);

        const id = this.latestEventId;
        this.latestEventId += 1;

        for (const snapshot of this.listeningSnapshots) {
            snapshot.updateToLatestEvent(parsed, id);
        }
    }

    async getDocumentsUpToDate(docs: DocumentMount[]) {
        for (const doc of docs) {
            if (doc.upToDateWith != null) {
                throw new Error(`not implemented: calling getDocumentsUpToDate `
                                +`on doc with non-null upToDateWith`);
            }
        }

        for (const event of this.everyEvent) {
            for (const doc of docs) {
                applyEventToDocument(doc, event);
            }
        }
    }

    createSnapshot() {
        const snapshot = new Snapshot();
        this.listeningSnapshots.push(snapshot);
        snapshot.store = this;
        return snapshot;
    }
}
*/
