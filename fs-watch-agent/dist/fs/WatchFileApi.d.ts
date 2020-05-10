import { GraphLike, Relation } from '.';
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    findFileWatch(filename: string): Promise<string>;
    createFileWatch(filename: string): Promise<string>;
    listenToFile(watch: string, callback: (rel: Relation) => void): void;
}
