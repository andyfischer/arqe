import { GraphLike } from "..";
export default class API {
    graph: GraphLike;
    execId: string;
    constructor(graph: GraphLike);
    getCliInput(name: string): Promise<string>;
}
