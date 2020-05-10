import Graph from './Graph';
import Relation from './Relation';
import Command from './Command';
declare type RecomputeFunc<T> = (rels: Relation[]) => T;
export default class SavedQueryCache<T> {
    graph: Graph;
    recompute: RecomputeFunc<T>;
    stale: boolean;
    result: any;
    getCommand: Command;
    constructor(graph: Graph, tags: string, recompute: RecomputeFunc<T>);
    _update(): void;
    get(): any;
    onRelationUpdated(rel: Relation): void;
    onRelationDeleted(rel: Relation): void;
}
export {};
