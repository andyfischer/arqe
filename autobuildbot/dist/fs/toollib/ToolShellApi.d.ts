import { GraphLike } from "..";
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    listCliInputs(toolname: string): Promise<string[]>;
    cliInputIsRequired(toolname: string, name: string): Promise<boolean>;
    createToolExecution(): Promise<string>;
    setCliInput(execId: string, name: string, value: string): Promise<void>;
}
