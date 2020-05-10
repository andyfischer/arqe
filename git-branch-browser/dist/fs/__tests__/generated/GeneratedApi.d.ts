import { GraphLike } from "../..";
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    getOneTag(): string;
    getOneTagValue(): string;
    getCurrentFlag(target: string): string;
    getUsingCommandChain(target: string): string;
    changeFlag(target: string, val: string): void;
}
