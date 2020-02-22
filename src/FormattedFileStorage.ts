
import StorageProvider from './StorageProvider'
import Pattern from './Pattern'
import Command from './Command'
import SetOperation from './SetOperation'
import RelationSearch from './RelationSearch'

export default class FormattedFileStorage implements StorageProvider {
    async runSearch(search: RelationSearch) {
        // get.finishSearch();
    }
    async runSave(set: SetOperation) {
        set.saveFinished(null);
    }
}
