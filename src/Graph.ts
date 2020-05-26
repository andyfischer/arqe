
import { parseCommandChain } from './parseCommand'
import Pattern from './Pattern'
import Relation from './Relation'
import SavedQuery from './SavedQuery'
import EagerValue from './EagerValue'
import { UpdateFn } from './UpdateContext'
import InheritTags, { updateInheritTags } from './InheritTags'
import TypeInfo from './TypeInfo'
import RelationReceiver from './RelationReceiver'
import { receiveToRelationList, fallbackReceiver } from './receivers'
import { runCommandChain, singleCommandExecution } from './runCommand'
import UpdateContext from './UpdateContext'
import TagTypeOrdering from './TagTypeOrdering'
import IDSource from './utils/IDSource'
import receiveToStringList from './receiveToStringList'
import GraphListener, { GraphListenerMount } from './GraphListenerV3'
import { parsePattern } from './parseCommand'
import watchAndValidateCommand from './watchAndValidateCommand'
import { receiveToRelationListPromise } from './receivers'
import SaveSearchHook from './SaveSearchHook'
import StorageProvider from './StorageProvider'
import Database from './Database'
import LoggingHooks from './LoggingHooks'

export default class Graph {

    database = new Database(this);
    listeners: GraphListenerMount[] = []

    savedQueries: SavedQuery[] = []
    savedQueryMap: { [queryStr:string]: SavedQuery } = {}

    ordering = new TagTypeOrdering()
    typeInfo: { [typeName: string]: TypeInfo } = {}
    inheritTags: EagerValue<InheritTags>

    eagerValueIds = new IDSource()
    graphListenerIds = new IDSource()

    storageProvidersV3: StorageProvider[] = []
    loggingHooks: LoggingHooks

    relationCreatedListeners: { pattern: Pattern, onCreate: (rel: Relation) => void}[] = []

    constructor() {
        this.database.schema.setupBuiltinViews(this);
        this.inheritTags = this.eagerValue(updateInheritTags, new InheritTags());
        this.eagerValue(this.ordering.update);
        this.loggingHooks = new LoggingHooks(this)
    }

    savedQuery(queryStr: string): SavedQuery {
        if (this.savedQueryMap[queryStr])
            return this.savedQueryMap[queryStr];

        if (this.savedQueries.length == 100)
            console.log('warning: more than 100 saved queries');

        const query = new SavedQuery(this, this.savedQueries.length, queryStr);
        this.savedQueries.push(query);
        this.savedQueryMap[queryStr] = query;

        return query;
    }

    eagerValue<T>(updateFn: UpdateFn<T>, initialValue?: T): EagerValue<T> {
        const ev = new EagerValue<T>(this, updateFn, initialValue);
        ev.runUpdate();
        return ev;
    }

    getTypeInfo(name: string) {
        if (!this.typeInfo[name]) {
            this.typeInfo[name] = new TypeInfo();
        }

        return this.typeInfo[name];
    }

    addListener(pattern: Pattern, listener: GraphListener) {
        this.listeners.push({ pattern, listener });
    }

    onRelationCreated(rel: Relation) {
        for (const { pattern, onCreate } of this.relationCreatedListeners)
            if (rel.matches(pattern))
                onCreate(rel);
    }

    onRelationUpdated(rel: Relation) {

        // console.log('onRelationUpdated: ' + rel.stringify() + ` (${this.listeners.length} listenrers)`);

        for (const entry of this.listeners) {
            if (entry.pattern.matches(rel)) {
                // console.log(' listener matches: ' + entry.pattern.stringify())
                entry.listener.onRelationUpdated(rel);
            } else {
                // console.log(' listener does not match: ' + entry.pattern.stringify())
            }
        }

        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.matches(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
    }

    onRelationDeleted(rel: Relation) {
        for (const entry of this.listeners) {
            if (entry.pattern.matches(rel))
                entry.listener.onRelationDeleted(rel);
        }

        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.matches(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
    }

    run(commandStr: string, output?: RelationReceiver) {

        if (/^ *\#/.exec(commandStr)) {
            // ignore comments
            return;
        }

        if (!output) {
            output = fallbackReceiver(commandStr);
        }

        output = watchAndValidateCommand(commandStr, output);

        const chain = parseCommandChain(commandStr);
        runCommandChain(this, chain, output);
    }

    runSyncOld(commandStr: string) {
        let result = null;

        const receiver = receiveToStringList(r => { result = r; });
        
        this.run(commandStr, receiver);

        if (result === null)
            throw new Error("command didn't have sync response in runSync");

        return result;
    }

    runSync(commandStr: string): Relation[] {
        return this.runCommandChainSync(commandStr);
    }

    runCommandChainSync(commandStr: string): Relation[] {
        const chain = parseCommandChain(commandStr);

        let rels: Relation[] = null;

        const receiver = receiveToRelationList(r => {
            rels = r
        });

        runCommandChain(this, chain, receiver);

        if (rels === null)
            throw new Error("command didn't finish synchronously: " + commandStr);

        return rels;
    }

    runDerived(callback: (cxt: UpdateContext) => void) {
        const cxt = new UpdateContext(this);
        return callback(cxt);
    }

    watchIsAnyoneListening(pattern: Pattern) {
    }

    close() { }
}

