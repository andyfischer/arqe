
import Relation from './Relation'

export default interface GraphLike {
    getRelationsSync: (tags: string) => Relation[];
    runCommandChainSync: (commandStr: string) => Relation[];
}
