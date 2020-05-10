import Relation from '../Relation';
import Pattern from '../Pattern';
import StorageProvider from '../StorageProvider';
import RelationSearch from '../RelationSearch';
import RelationReceiver from '../RelationReceiver';
import Graph from '../Graph';
export default class InMemoryStorage implements StorageProvider {
    graph: Graph;
    relationsByNtag: {
        [ntag: string]: Relation;
    };
    constructor(graph: Graph);
    linearScan(pattern: Pattern): Generator<Relation, void, unknown>;
    findAllMatches(pattern: Pattern): Generator<Relation, void, unknown>;
    runSearch(search: RelationSearch): void;
    runSave(relation: Relation, output: RelationReceiver): void;
    deleteRelation(rel: Relation): void;
}
