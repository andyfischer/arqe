import Graph from './Graph';
export default class API {
    graph: Graph;
    constructor(graph: Graph);
    run(command: string): void;
    enableVerboseLogging(): boolean;
    listTouchpoints(): string[];
    touchpointFunctionName(touchpoint: string): string;
    touchpointExpectOne(touchpoint: string): boolean;
    touchpointOutputIsOptional(touchpoint: string): boolean;
    touchpointOutputIsValue(touchpoint: string): boolean;
    touchpointOutputIsExists(touchpoint: string): boolean;
    touchpointTagValueOutputs(touchpoint: string): string[];
    touchpointTagValueOutput(touchpoint: string): string;
    touchpointTagOutputs(touchpoint: string): string[];
    touchpointTagOutput(touchpoint: string): string[];
}
