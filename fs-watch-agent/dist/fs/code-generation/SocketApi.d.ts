import { GraphLike } from '..';
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    createUniqueConnection(): string;
    deleteConnection(connection: string): void;
}
