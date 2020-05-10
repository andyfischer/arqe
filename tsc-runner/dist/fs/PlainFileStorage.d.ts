import StorageProvider from './StorageProvider';
import SetOperation from './SetOperation';
import RelationSearch from './RelationSearch';
export default class PlainFileStorage implements StorageProvider {
    filenameType: 'filename';
    directory: string;
    runSearch(search: RelationSearch): Promise<void>;
    runSave(set: SetOperation): Promise<void>;
}
