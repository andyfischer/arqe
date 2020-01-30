
import StorageProvider from './StorageProvider'
import RelationPattern from './RelationPattern'
import Command from './Command'
import GetOperation from './GetOperation'
import SetOperation from './SetOperation'

export default class FormattedFileStorage implements StorageProvider {
    async runSearch(get: GetOperation) {
        get.finishSearch();
    }
    async runSave(set: SetOperation) {
        set.saveFinished(null);
    }
}
