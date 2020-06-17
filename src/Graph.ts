
import { parseCommandChain } from './parseCommand'
import Pattern from './Pattern'
import Tuple from './Tuple'
import SavedQuery from './SavedQuery'
import EagerValue from './EagerValue'
import { UpdateFn } from './UpdateContext'
import Stream from './Stream'
import { receiveToTupleList, fallbackReceiver, receiveToTupleListPromise } from './receiveUtils'
import runCommandChain from './runCommandChain'
import UpdateContext from './UpdateContext'
import IDSource from './utils/IDSource'
import receiveToStringList from './receiveToStringList'
import GraphListener, { GraphListenerMount } from './GraphListenerV3'
import { parsePattern } from './parseCommand'
import watchAndValidateCommand from './watchAndValidateCommand'
import StorageProvider from './StorageProvider'
import TupleStore from './TupleStore'
import Column from './Column'
import getBuiltinViews from './getBuiltinViews'
import parseObjectToPattern from './parseObjectToPattern'
import CommandChain from './CommandChain'
import Command from './Command'

export default class Graph {

    listeners: GraphListenerMount[] = []

    savedQueries: SavedQuery[] = []
    savedQueryMap: { [queryStr:string]: SavedQuery } = {}

    eagerValueIds = new IDSource()
    graphListenerIds = new IDSource()

    storageProvidersV3: StorageProvider[] = []

    relationCreatedListeners: { pattern: Pattern, onCreate: (rel: Tuple) => void }[] = []

    tupleStore: TupleStore
    columns: { [name: string]: Column } = {}

    constructor() {
        this.tupleStore = new TupleStore(this);

        const builtinViews = getBuiltinViews(this);

        for (const name in builtinViews) {
            const column = this.initColumn(name);
            column.storageProvider = builtinViews[name];
        }
    }

    initColumn(name: string) {

        if (!this.columns[name])
            this.columns[name] = new Column(name);

        return this.columns[name];
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

    addListener(pattern: Pattern, listener: GraphListener) {
        this.listeners.push({ pattern, listener });
    }

    onTupleCreated(rel: Tuple) {
        for (const { pattern, onCreate } of this.relationCreatedListeners)
            if (rel.isSupersetOf(pattern))
                onCreate(rel);
    }

    onTupleUpdated(rel: Tuple) {

        // console.log('onRelationUpdated: ' + rel.stringify() + ` (${this.listeners.length} listenrers)`);

        for (const entry of this.listeners) {
            if (entry.pattern.isSupersetOf(rel)) {
                // console.log(' listener isSupersetOf: ' + entry.pattern.stringify())
                entry.listener.onTupleUpdated(rel);
            } else {
                // console.log(' listener does not match: ' + entry.pattern.stringify())
            }
        }

        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.isSupersetOf(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
    }

    onTupleDeleted(rel: Tuple) {
        for (const entry of this.listeners) {
            if (entry.pattern.isSupersetOf(rel))
                entry.listener.onTupleDeleted(rel);
        }

        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.isSupersetOf(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
    }

    run(commandStr: string, output?: Stream) {

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

    runSync(commandStr: string): Tuple[] {
        return this.runCommandChainSync(commandStr);
    }

    runAsync(commandStr: string): Promise<Tuple[]> {
        const { receiver, promise } = receiveToTupleListPromise();
        this.run(commandStr, receiver);
        return promise;
    }

    runCommandChainSync(commandStr: string): Tuple[] {
        const chain = parseCommandChain(commandStr);

        let rels: Tuple[] = null;

        const receiver = receiveToTupleList(r => {
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

    get(patternInput: any, receiver: Stream) {
        let pattern: Pattern;
        if (typeof patternInput === 'string') {
            pattern = parsePattern(patternInput);
        } else {
            pattern = parseObjectToPattern(patternInput);
        }

        runCommandChain(this, new CommandChain([new Command('get', pattern, {})]), receiver);
    }

    set(patternInput: any, receiver: Stream) {
        let pattern: Pattern;
        if (typeof patternInput === 'string') {
            pattern = parsePattern(patternInput);
        } else {
            pattern = parseObjectToPattern(patternInput);
        }

        runCommandChain(this, new CommandChain([new Command('set', pattern, {})]), receiver);
    }

    setAsync(patternInput: any): Promise<Tuple[]> {
        const { receiver, promise } = receiveToTupleListPromise();
        this.set(patternInput, receiver);
        return promise;
    }

    close() { }
}

