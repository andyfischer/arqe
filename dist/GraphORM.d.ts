import Graph from './Graph';
export declare function createUniqueEntity(graph: Graph, typename: string): string;
export declare function saveObject(graph: Graph, patternStr: string, object: any): Promise<void>;
