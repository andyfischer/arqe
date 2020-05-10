import Relation from './Relation';
import RelationPattern from './RelationPattern';
import StorageProvider from './StorageProvider';
import SetOperation from './SetOperation';
import RelationSearch from './RelationSearch';
export default class InMemoryStorage implements StorageProvider {
    relationsByNtag: {
        [ntag: string]: Relation;
    };
    everyRelation(): Generator<RelationPattern, void, unknown>;
    deleteRelation(rel: Relation): void;
    linearScan(pattern: RelationPattern): Generator<RelationPattern, void, unknown>;
    findExactMatch(pattern: RelationPattern): Relation | null;
    findAllMatches(pattern: RelationPattern): Generator<RelationPattern, void, unknown>;
    runSearch(search: RelationSearch): void;
    runSave(set: SetOperation): void;
}
