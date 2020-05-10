import IDSource from './utils/IDSource';
import Graph from './Graph';
import GraphListener from './GraphListenerV3';
import Relation from './Relation';
interface Entity {
    id: string;
    attrs: {
        [name: string]: string;
    };
}
export default class ObjectSpace {
    name: string;
    idSource: IDSource;
    objects: Map<string, Entity>;
    attributes: Map<string, boolean>;
    constructor(name: string);
    nextId(): string;
    defineAttribute(name: string): void;
    hasObject(id: string): boolean;
    object(id: string): Entity;
    createObject(id: string): Entity;
    getExistingObject(id: string): Entity;
}
export declare class ObjectTypeSpace implements GraphListener {
    graph: Graph;
    columns: Map<string, ObjectSpace>;
    constructor(graph: Graph);
    hasColumn(name: string): boolean;
    column(name: string): ObjectSpace;
    maybeInitEntityColumn(name: string): void;
    onRelationCreated(rel: Relation): void;
    onRelationUpdated(rel: Relation): void;
    onRelationDeleted(rel: Relation): void;
}
export {};
