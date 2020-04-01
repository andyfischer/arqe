
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export default class RelationPipe {
    _onRelation: (rel: Relation) => void
    _onDone: () => void

    _backlog: Relation[] = []
    _wasClosed: boolean

    // Writer API
    relation(rel: Relation) {
        if (this._onRelation)
            this._onRelation(rel);
        else
            this._backlog.push(rel);
    }

    isDone() {
        return false;
    }

    finish() {
        if (this._onDone)
            this._onDone();
        else
            this._wasClosed = true;
    }

    // Reader API
    onRelation(callback: (rel: Relation) => void) {
        if (this._onRelation)
            throw new Error('already have an onRelation callback');

        this._onRelation = callback;

        for (const r of this._backlog)
            this._onRelation(r);
    }

    onDone(callback: () => void) {
        if (this._onDone)
            throw new Error('already have an onDone callback');

        this._onDone = callback;

        if (this._wasClosed)
            this._onDone();
    }

    waitForAll(callback: (rels: Relation[]) => void) {
        const rels = [];
        this.onRelation(rel => { rels.push(rel) });
        this.onDone(() => callback(rels));
    }

    pipeToReceiver(receiver: RelationReceiver) {
        this.onRelation(rel => receiver.relation(rel));
        this.onDone(() => receiver.finish());
    }
}
