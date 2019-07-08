
import { Snapshot } from '../framework'

export default interface Store {
    saveQuery: (query: string) => Promise<void>
    createSnapshot: () => Snapshot
}
