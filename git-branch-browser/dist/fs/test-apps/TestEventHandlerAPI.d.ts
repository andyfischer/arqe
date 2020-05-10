import { GraphLike } from "..";
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    eventListener(handler: (evt: any) => void): void;
    pushObject(obj: string): void;
    deleteObject(obj: string): void;
    pushValueChange(val: string): void;
    pushInitialValue(val: string): void;
}
