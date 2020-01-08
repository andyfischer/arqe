
import GetOperation from './GetOperation'
import SetOperation from './SetOperation'

export default interface CustomStorage {
    get: (get: GetOperation) => void
    set: (set: SetOperation) => void
}
