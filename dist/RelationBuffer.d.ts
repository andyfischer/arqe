import Relation from './Relation';
import RelationReceiver from './RelationReceiver';
export default class RelationBuffer implements RelationReceiver {
    items: Relation[];
    onDone: (rels: Relation[]) => void;
    constructor(onDone: (rels: Relation[]) => void);
    start(): void;
    relation(rel: Relation): void;
    finish(): void;
    isDone(): boolean;
    error(e: any): void;
}
