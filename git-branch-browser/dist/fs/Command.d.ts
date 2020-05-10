import Pattern from './Pattern';
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
    flags: CommandFlags;
    pattern: Pattern;
    constructor(commandName: string, pattern: Pattern, flags: FlagMap);
    toPattern(): Pattern;
    toRelation(): Pattern;
    stringify(): string;
}
export {};
