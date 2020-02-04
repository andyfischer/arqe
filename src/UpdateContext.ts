
import Graph from './Graph'
import Relation from './Relation'

export type UpdateFn<T> = (cxt: UpdateContext) => T

export default class UpdateContext {

    graph: Graph

    getRelations(tags: string): Relation[] {
        return []
    }

}
