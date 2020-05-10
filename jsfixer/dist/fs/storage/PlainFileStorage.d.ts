import StorageProvider from '../StorageProvider';
import Relation from '../Relation';
import RelationSearch from '../RelationSearch';
import RelationReceiver from '../RelationReceiver';
export default class PlainFileStorage implements StorageProvider {
    filenameType: 'filename';
    directory: string;
    runSearch(search: RelationSearch): Promise<void>;
    runSave(relation: Relation, output: RelationReceiver): Promise<void>;
}
