import Graph from './Graph';
import { UpdateFn } from './UpdateContext';
export default class EagerValue<T> {
    graph: Graph;
    id: number;
    updateFn: UpdateFn<T>;
    value: T;
    constructor(graph: Graph, updateFn: UpdateFn<T>, initialValue?: T);
    runUpdate(): void;
    get(): T;
}
