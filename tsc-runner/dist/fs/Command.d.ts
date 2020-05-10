import RelationPattern from './RelationPattern';
import { PatternTag } from './RelationPattern';
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
    toPattern(): RelationPattern;
    stringify(): string;
}
export {};
