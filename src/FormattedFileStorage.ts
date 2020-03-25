
import StorageProvider from './StorageProvider'
import Pattern from './Pattern'
import Command from './Command'
import SetOperation from './SetOperation'
import RelationSearch from './RelationSearch'
import RelationReceiver from './RelationReceiver'

export default class FormattedFileStorage implements StorageProvider {
    async runSearch(search: RelationSearch) {
        // get.finishSearch();
    }
    async runSave(command: Command, output: RelationReceiver) {
        // set.saveFinished(null);
    }
}
