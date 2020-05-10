import Graph from './Graph';
import Relation from './Relation';
import SavedQuery from './SavedQuery';
import SavedQueryWatch from './SavedQueryWatch';
export declare type UpdateFn<T> = (cxt: UpdateContext) => T;
export default class UpdateContext {
    graph: Graph;
    usedSearches: string[];
    constructor(graph: Graph);
    get(tags: string): Relation[];
    getOne(tags: string): Relation;
    getRelations(tags: string): Relation[];
    getOptionsObject(tags: string): any;
    savedQueriesForUsedSearches(): SavedQuery[];
    watchesForUsedSearches(): SavedQueryWatch[];
}
export declare function runUpdateOnce<T>(graph: Graph, fn: UpdateFn<T>): T;
