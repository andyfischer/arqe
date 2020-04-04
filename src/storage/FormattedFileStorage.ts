
import StorageProvider from '../StorageProvider'
import Relation from '../Relation'
import RelationSearch from '../RelationSearch'
import RelationReceiver from '../RelationReceiver'

export default class FormattedFileStorage implements StorageProvider {
    async runSearch(search: RelationSearch) {
        // get.finishSearch();
    }
    async runSave(relation: Relation, output: RelationReceiver) {
        // set.saveFinished(null);
    }
}
