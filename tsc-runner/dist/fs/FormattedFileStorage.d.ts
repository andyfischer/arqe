import StorageProvider from './StorageProvider';
import SetOperation from './SetOperation';
import RelationSearch from './RelationSearch';
export default class FormattedFileStorage implements StorageProvider {
    runSearch(search: RelationSearch): Promise<void>;
    runSave(set: SetOperation): Promise<void>;
}
