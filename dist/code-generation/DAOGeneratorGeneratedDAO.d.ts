import { GraphLike } from "..";
export default class API {
    graph: GraphLike;
    constructor(graph: GraphLike);
    listTargets(): string[];
    getInterfaceFields(target: string): {
        field: string;
        typeStr: string;
    }[];
    listTouchpoints(target: string): string[];
    getIkImport(target: string): string;
    enableVerboseLogging(target: string): boolean;
    touchpointFunctionName(touchpoint: string): string;
    touchpointStyle(touchpoint: string): string;
    touchpointExpectOne(touchpoint: string): boolean;
    touchpointIsAsync(touchpoint: string): boolean;
    touchpointIsListener(touchpoint: string): boolean;
    touchpointOutputIsOptional(touchpoint: string): boolean;
    touchpointOutputIsValue(touchpoint: string): boolean;
    touchpointOutputIsExists(touchpoint: string): boolean;
    touchpointOutput(touchpoint: string): string;
    touchpointOutputs(touchpoint: string): string[];
    touchpointOutputs2(touchpoint: string): {
        fromStr: string;
        varStr: string;
    }[];
    touchpointInputDataFrom(touchpoint: string, varStr: string): string;
    touchpointInputs(touchpoint: string): string[];
    touchpointInputs2(touchpoint: string): {
        varStr: string;
        typeStr: string;
    }[];
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
        field: string;
        tagValue: string;
    }[];
    outputObjectTagFields(outputObject: string): {
        field: string;
        tag: string;
    }[];
    outputObjectTagValueFields(outputObject: string): {
        field: string;
        tagValue: string;
    }[];
    touchpointEventTypes(touchpoint: string): string[];
    eventTypeQuery(eventType: string): string[];
    eventTypeIsDeletion(eventType: string): boolean;
    eventTypeId(eventType: string): string[];
    eventTypeProvides(eventType: string): {
        fromStr: string;
        varStr: string;
    }[];
}
