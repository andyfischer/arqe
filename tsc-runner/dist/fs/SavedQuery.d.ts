import Graph from './Graph';
import Command from './Command';
import RelationPattern from './RelationPattern';
import EagerValue from './EagerValue';
export default class SavedQuery {
    graph: Graph;
    id: number;
    queryStr: string;
    command: Command;
    pattern: RelationPattern;
    changeToken: number;
    connectedEagerValues: {
        [eagerValueId: string]: EagerValue<any>;
    };
    constructor(graph: Graph, id: number, queryStr: string);
    connectEagerValue(ev: EagerValue<any>): void;
    updateConnectedValues(): void;
}
