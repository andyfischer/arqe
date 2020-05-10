import StorageProvider from './StorageProvider';
import Relation from './Relation';
import RelationSearch from './RelationSearch';
import RelationReceiver from './RelationReceiver';
export default class FormattedFileStorage implements StorageProvider {
    runSearch(search: RelationSearch): Promise<void>;
    runSave(relation: Relation, output: RelationReceiver): Promise<void>;
}
