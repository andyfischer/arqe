
import Relation from './Relation'

export default interface GraphLike {
    runSync: (commandStr: string) => Relation[];
}
