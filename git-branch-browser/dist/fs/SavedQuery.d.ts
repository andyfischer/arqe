import Graph from './Graph';
import Command from './Command';
import Pattern from './Pattern';
import EagerValue from './EagerValue';
export default class SavedQuery {
    graph: Graph;
    id: number;
    queryStr: string;
    command: Command;
    pattern: Pattern;
    changeToken: number;
    connectedEagerValues: {
        [eagerValueId: string]: EagerValue<any>;
    };
    constructor(graph: Graph, id: number, queryStr: string);
    connectEagerValue(ev: EagerValue<any>): void;
    updateConnectedValues(): void;
}
