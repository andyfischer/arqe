
import StorageProvider from './StorageProvider'
import RelationPattern from './RelationPattern'
import Command from './Command'
import GetOperation from './GetOperation'

export default class FormattedFileStorage implements StorageProvider {
    runSearch(get: GetOperation) {
        get.finishSearch();
    }
    save(command: Command) {
        return null;
    }
}
