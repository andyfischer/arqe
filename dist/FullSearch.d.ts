import Graph from './Graph';
import { CommandTag } from './Command';
import Relation from './Relation';
export default class FullSearch {
    graph: Graph;
    fixedTags: CommandTag[];
    starValueTags: CommandTag[];
    constructor(graph: Graph, tags: CommandTag[]);
    relationMatches(rel: Relation): boolean;
    run(): any[];
}
