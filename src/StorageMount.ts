
import StorageProvider from './StorageProvider'
import Pattern from './Pattern'

export default interface StorageMount {
    pattern: Pattern
    storage: StorageProvider
}
