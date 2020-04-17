
import Relation from './Relation'

export default interface GraphLike {
    getRelationsSync: (tags: string) => Relation[];
    runSync: (commandStr: string) => Relation[];
}
