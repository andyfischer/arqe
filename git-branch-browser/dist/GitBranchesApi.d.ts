import { GraphLike } from "./fs";
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    getBranches(dir: string): Promise<string[]>;
    deleteBranch(dir: string, branch: string): Promise<void>;
}
