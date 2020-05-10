import Relation from './Relation';
import Pattern from './Pattern';
import StorageProvider from './StorageProvider';
import RelationSearch from './RelationSearch';
import RelationReceiver from './RelationReceiver';
import Graph from './Graph';
import IDSource from './utils/IDSource';
export default class InMemoryStorage implements StorageProvider {
    graph: Graph;
    relationsByNtag: {
        [ntag: string]: Relation;
    };
    nextUniqueIdPerType: {
        [typeName: string]: IDSource;
    };
    constructor(graph: Graph);
    linearScan(pattern: Pattern): Generator<Relation, void, unknown>;
    findAllMatches(pattern: Pattern): Generator<Relation, void, unknown>;
    runSearch(search: RelationSearch): void;
    runModification(commandRel: Relation, output: RelationReceiver): void;
    saveOne(relation: Relation, output: RelationReceiver): void;
    runSave(relation: Relation, output: RelationReceiver): void;
    deleteRelation(rel: Relation): void;
    runDelete(graph: Graph, pattern: Pattern, output: RelationReceiver): void;
}
