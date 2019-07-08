
import { Snapshot } from '../snapshot'

export default interface Store {
    saveQuery: (query: string) => Promise<void>
    createSnapshot: () => Snapshot
}
