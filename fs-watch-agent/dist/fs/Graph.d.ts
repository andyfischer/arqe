import CommandStep from './CommandStep';
import Pattern from './Pattern';
import Relation from './Relation';
import GraphListener from './GraphListener';
import InMemoryStorage from './InMemoryStorage';
import SavedQuery from './SavedQuery';
import StorageMount from './StorageMount';
import EagerValue from './EagerValue';
import { UpdateFn } from './UpdateContext';
import InheritTags from './InheritTags';
import TypeInfo from './TypeInfo';
import WebSocketProvider from './WebSocketProvider';
import RelationReceiver from './RelationReceiver';
import UpdateContext from './UpdateContext';
import TagTypeOrdering from './TagTypeOrdering';
import IDSource from './utils/IDSource';
import GraphListenerV2 from './GraphListenerV2';
import { GraphListenerMountV3 } from './GraphListenerV3';
import { ObjectTypeSpace } from './ObjectSpace';
import GraphListenerV3 from './GraphListenerV3';
export default class Graph {
    inMemory: InMemoryStorage;
    objectTypes: ObjectTypeSpace;
    listeners: GraphListener[];
    listenersV3: GraphListenerMountV3[];
    savedQueries: SavedQuery[];
    savedQueryMap: {
        [queryStr: string]: SavedQuery;
    };
    ordering: TagTypeOrdering;
    typeInfo: {
        [typeName: string]: TypeInfo;
    };
    inheritTags: EagerValue<InheritTags>;
    filesystemMounts: EagerValue<StorageMount[]>;
    wsProviders: EagerValue<WebSocketProvider[]>;
    derivedValueMounts: StorageMount[];
    eagerValueIds: IDSource;
    graphListenerIds: IDSource;
    graphListenersV2: {
        [id: string]: GraphListenerV2;
    };
    constructor();
    savedQuery(queryStr: string): SavedQuery;
    eagerValue<T>(updateFn: UpdateFn<T>, initialValue?: T): EagerValue<T>;
    iterateMounts(): Generator<StorageMount, void, unknown>;
    getTypeInfo(name: string): TypeInfo;
    listen(step: CommandStep): void;
    addListenerV3(pattern: Pattern, listener: GraphListenerV3): void;
    onRelationCreated(rel: Relation): void;
    onRelationUpdatedV3(rel: Relation): void;
    onRelationDeletedV3(rel: Relation): void;
    onRelationUpdated(rel: Relation): void;
    onRelationDeleted(rel: Relation): void;
    run(commandStr: string, output?: RelationReceiver): void;
    runSilent(str: string): void;
    runSyncOld(commandStr: string): any;
    runSync(commandStr: string): Relation[];
    runCommandChainSync(commandStr: string): Relation[];
    relationPattern(commandStr: string): import("./Pattern").PatternValue;
    getRelationsSync(tags: string): Relation[];
    getOneRelationSync(tags: string): Relation;
    getOneRelationOptionalSync(tags: string): Relation | null;
    runDerived(callback: (cxt: UpdateContext) => void): void;
    addListener(patternStr: string, callback: () => void): GraphListenerV2;
    loadDumpFile(filename: string): void;
    loadDump(contents: string): void;
    saveDumpFile(filename: string): void;
    static loadFromDumpFile(filename: string): Graph;
}
