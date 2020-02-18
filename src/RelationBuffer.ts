
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export default class RelationBuffer implements RelationReceiver {
    items: Relation[] = []
    done: boolean
    onError: (e: string) => void
    onDone?: () => void

    start() {}
    relation(rel: Relation) { this.items.push(rel) }
    deleteRelation() { throw new Error('RelationBuffer doesnt support deleteRelation') }
    
    finish() {
        this.done = true
    }

    isDone() {
        return this.done;
    }

    error(e) {
        this.onError(e)
    }

    take(): Relation[] {
        const rels = this.items;
        this.items = [];
        return rels;
    }
}
