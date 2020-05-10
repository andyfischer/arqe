import { GraphLike } from '..';
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    fromFile(target: string): string;
    destinationFilename(target: string): string;
}
