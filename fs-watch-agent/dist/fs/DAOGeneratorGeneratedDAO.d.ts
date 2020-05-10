import { GraphLike } from '.';
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    listTargets(): string[];
    listTouchpoints(target: string): string[];
    getIkImport(target: string): string;
    enableVerboseLogging(target: string): boolean;
    touchpointFunctionName(touchpoint: string): string;
    touchpointExpectOne(touchpoint: string): boolean;
    touchpointIsAsync(touchpoint: string): boolean;
    touchpointIsListener(touchpoint: string): boolean;
    touchpointOutputIsOptional(touchpoint: string): boolean;
    touchpointOutputIsValue(touchpoint: string): boolean;
    touchpointOutputIsExists(touchpoint: string): boolean;
    touchpointTagValueOutputs(touchpoint: string): string[];
    touchpointTagValueOutput(touchpoint: string): string;
    touchpointTagOutputs(touchpoint: string): string[];
    touchpointTagOutput(touchpoint: string): string[];
    touchpointOutputType(touchpoint: string): string;
    touchpointInputs(touchpoint: string): string[];
    inputTagType(input: string): string;
    inputName(input: string): string;
    inputSortOrder(input: string): string;
    inputType(input: string): string;
    touchpointQueryString(touchpoint: string): string;
    getDestinationFilename(target: string): string;
    getOutputObjectdef(touchpoint: string): string;
    getObjectdefFields(objectdef: string): string[];
    touchpointOutputObject(touchpoint: string): string;
    outputObjectFields(outputObject: string): {
        field: any;
        tagValue: any;
    }[];
    outputObjectTagFields(outputObject: string): {
        field: any;
        tag: any;
    }[];
    outputObjectTagValueFields(outputObject: string): {
        field: any;
        tagValue: any;
    }[];
}
