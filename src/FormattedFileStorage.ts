
import StorageProvider from './StorageProvider'
import RelationPattern from './RelationPattern'
import Command from './Command'

export default class FormattedFileStorage implements StorageProvider {
    *findAllMatches(pattern: RelationPattern) {
    }
    save(command: Command) {
        return null;
    }
}
