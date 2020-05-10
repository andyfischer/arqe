import Graph from './Graph';
import RelationPattern from './RelationPattern';
export declare function createUniqueEntity(graph: Graph, typename: string): string;
export declare function saveObject(graph: Graph, patternStr: string, object: any): Promise<RelationPattern>;
