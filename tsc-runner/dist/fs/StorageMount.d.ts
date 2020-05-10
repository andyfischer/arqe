import StorageProvider from './StorageProvider';
import RelationPattern from './RelationPattern';
export default interface StorageMount {
    pattern: RelationPattern;
    storage: StorageProvider;
}
