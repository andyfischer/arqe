
import StorageProvider from '../StorageProvider'
import Relation from '../Relation'
import SearchOperation from '../SearchOperation'
import RelationReceiver from '../RelationReceiver'

export default class FormattedFileStorage implements StorageProvider {
    async runSearch(search: SearchOperation) {
        // get.finishSearch();
    }
    async runSave(relation: Relation, output: RelationReceiver) {
        // set.saveFinished(null);
    }
}
