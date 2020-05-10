import { GraphLike } from '.';
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    listCodeGenerationTargets(): string[];
    codeGenerationTargetStrategy(target: string): string;
}
