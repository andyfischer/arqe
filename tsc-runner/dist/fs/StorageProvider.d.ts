import SetOperation from './SetOperation';
import RelationSearch from './RelationSearch';
export default interface StorageProvider {
    runSearch: (search: RelationSearch) => void;
    runSave: (set: SetOperation) => void;
}
