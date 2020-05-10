import StorageProvider from '../StorageProvider';
import Relation from '../Relation';
import SearchOperation from '../SearchOperation';
import RelationReceiver from '../RelationReceiver';
export default class FormattedFileStorage implements StorageProvider {
    runSearch(search: SearchOperation): Promise<void>;
    runSave(relation: Relation, output: RelationReceiver): Promise<void>;
}
