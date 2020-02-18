
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export default class RelationBuffer implements RelationReceiver {
    items: Relation[] = []
    done: boolean
    downstream: RelationReceiver

    constructor(downstream: RelationReceiver) {
        this.downstream = downstream;
    }

    start() {
        this.downstream.start();
    }

    relation(rel: Relation) {
        this.items.push(rel);
    }

    finish() {
        this.done = true;
        this.downstream.finish();
    }

    isDone() {
        return this.done;
    }

    error(e) {
        this.downstream.error(e);
    }

    take(): Relation[] {
        const rels = this.items;
        this.items = [];
        return rels;
    }
}
