import Command from './Command';
import CommandChain from './CommandChain';
import Relation from './Relation';
import PatternTag from './PatternTag';
export declare function parseRelation(str: string): Relation;
export declare function parseTag(str: string): PatternTag;
export declare function parsePattern(str: string): import("./Pattern").PatternValue;
export default function parseCommand(str: string): Command;
export declare function parseCommandChain(str: string): CommandChain;
