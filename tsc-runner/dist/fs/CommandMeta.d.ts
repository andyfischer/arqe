import RelationPattern from './RelationPattern';
import RelationReceiver from './RelationReceiver';
export declare function emitCommandMeta(output: RelationReceiver, fields: any): void;
export declare function emitCommandError(output: RelationReceiver, msg: string): void;
export declare function emitMetaInfoForUnboundVars(pattern: RelationPattern, output: RelationReceiver): void;
