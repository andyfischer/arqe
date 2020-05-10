import RelationPattern from './RelationPattern';
import RelationSearch from './RelationSearch';
import StorageProvider from './StorageProvider';
import SetOperation from './SetOperation';
export default class RawObjectStorage implements StorageProvider {
    linkedPattern: RelationPattern;
    value: any;
    variedType: string;
    constructor(pattern: RelationPattern);
    findAllMatches(pattern: RelationPattern): Generator<RelationPattern, void, unknown>;
    runSearch(search: RelationSearch): void;
    runSave(set: SetOperation): void;
}
