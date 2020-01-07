
import SetOperation from './SetOperation'
import Get from './Get'

export default interface CustomStorage {
    set: (set: SetOperation) => void
    get: (get: Get) => void
}
