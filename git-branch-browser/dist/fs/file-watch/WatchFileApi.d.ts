import { GraphLike } from "..";
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    findFileWatch(filename: string): Promise<string>;
    findFileWatch2(filename: string): Promise<string>;
    listenToFile(watch: string, callback: (version: string) => void): void;
    postChange(filename: string): Promise<void>;
    findWatchesForFilename(filename: string): Promise<string[]>;
    createWatch(filename: string): Promise<string>;
    incrementVersion(filename: string): Promise<void>;
}
