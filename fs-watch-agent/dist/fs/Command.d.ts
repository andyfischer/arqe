import { PatternValue } from './Pattern';
import PatternTag from './PatternTag';
declare type FlagMap = {
    [flag: string]: any;
};
export interface CommandFlags {
    x?: true;
    list?: true;
    get?: true;
    count?: true;
    exists?: true;
}
export default class Command {
    commandName: string;
    tags: PatternTag[];
    flags: CommandFlags;
    payloadStr: string;
    constructor(commandName: string, tags: PatternTag[], payload: string, flags: FlagMap);
    toPattern(): PatternValue;
    toRelation(): PatternValue;
    stringify(): string;
}
export {};
