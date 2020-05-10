import Graph from './Graph';
interface Options {
    expectOne?: boolean;
    inputs?: any[];
}
export default class GraphSavedQueryAPI {
    graph: Graph;
    constructor(graph: Graph);
    func(commandStr: string, options: Options): (...inputs: any[]) => void;
    run(s: string): void;
}
export {};
