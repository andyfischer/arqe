import Graph from './Graph';
import Relation from './Relation';
import GraphListener from './GraphListener';
import Command from './Command';
declare type RecomputeFunc<T> = (rels: Relation[]) => T;
export default class ListenCache<T> implements GraphListener {
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
