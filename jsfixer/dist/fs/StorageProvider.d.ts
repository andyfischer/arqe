import Relation from './Relation';
import RelationSearch from './RelationSearch';
import RelationReceiver from './RelationReceiver';
export default interface StorageProvider {
    runSearch: (search: RelationSearch) => void;
    runSave: (relation: Relation, output: RelationReceiver) => void;
}
