
import GetOperation from './GetOperation'
import SetOperation from './SetOperation'

export default interface CustomStorage {
    get?: (get: GetOperation) => void
    set?: (set: SetOperation) => void
    getAsync?: (get: GetOperation) => Promise<void>
    setAsync?: (set: SetOperation) => Promise<void>
}
