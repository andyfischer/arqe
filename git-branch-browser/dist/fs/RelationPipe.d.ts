import Relation from './Relation';
import RelationReceiver from './RelationReceiver';
export default class RelationPipe {
    _onRelation: (rel: Relation) => void;
    _onDone: () => void;
    _backlog: Relation[];
    _wasClosed: boolean;
    relation(rel: Relation): void;
    isDone(): boolean;
    finish(): void;
    onRelation(callback: (rel: Relation) => void): void;
    onDone(callback: () => void): void;
    waitForAll(callback: (rels: Relation[]) => void): void;
    pipeToReceiver(receiver: RelationReceiver): void;
}
