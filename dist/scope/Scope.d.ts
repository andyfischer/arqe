import Slot from './Slot';
import Graph from './Graph';
export default class Scope {
    graph: Graph;
    constructor(graph: Graph);
    createSlot(name: string): Slot;
    createSlotAndSet(name: string, initialValue: any): void;
    getOptional(name: string, defaultValue: any): any;
    get(name: string): any;
    set(name: string, value: any): void;
    modify(name: string, callback: (val: any) => any): void;
}
