import Graph from './Graph';
import { UpdateFn } from './UpdateContext';
import SavedQueryWatch from './SavedQueryWatch';
export default class CachedValue<T> {
    graph: Graph;
    updateFn: UpdateFn<T>;
    hasValue: boolean;
    value: T;
    watchedQueries: SavedQueryWatch[];
    constructor(graph: Graph, updateFn: UpdateFn<T>);
    runUpdate(): void;
    get(): T;
}
