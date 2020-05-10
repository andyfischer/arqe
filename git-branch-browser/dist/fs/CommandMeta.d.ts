import Pattern from './Pattern';
import RelationReceiver from './RelationReceiver';
import Command from './Command';
export declare function emitCommandMeta(output: RelationReceiver, fields: any): void;
export declare function emitCommandError(output: RelationReceiver, msg: string): void;
export declare function emitSearchPatternMeta(pattern: Pattern, output: RelationReceiver): void;
export declare function emitActionPerformed(output: RelationReceiver): void;
export declare function emitCommandOutputFlags(command: Command, output: RelationReceiver): void;
export declare function emitRelationDeleted(pattern: Pattern, output: RelationReceiver): void;
