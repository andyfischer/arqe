import StorageProvider from '../StorageProvider';
import Relation from '../Relation';
import SearchOperation from '../SearchOperation';
import RelationReceiver from '../RelationReceiver';
export default class PlainFileStorage implements StorageProvider {
    filenameType: 'filename';
    directory: string;
    runSearch(search: SearchOperation): Promise<void>;
    runSave(relation: Relation, output: RelationReceiver): Promise<void>;
}
