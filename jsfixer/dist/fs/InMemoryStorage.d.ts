import Relation from './Relation';
import Pattern from './Pattern';
import RelationReceiver from './RelationReceiver';
import Graph from './Graph';
import IDSource from './utils/IDSource';
interface Slot {
    relation: Pattern;
    modify: (f: (rel: Pattern) => Pattern) => Pattern;
    del: () => void;
}
export default class InMemoryStorage {
    graph: Graph;
    nextUniqueIdPerType: {
        [typeName: string]: IDSource;
    };
    stored: {
        [storageId: string]: Relation;
    };
    nextStorageId: IDSource;
    constructor(graph: Graph);
    resolveExpressionValues(rel: Relation): Pattern;
    findStored(pattern: Pattern): Iterable<{
        storageId: string;
        relation: Relation;
    }>;
    saveNewRelation(relation: Relation, output: RelationReceiver): void;
    iterateSlots(pattern: Pattern): Iterable<Slot>;
}
export {};
