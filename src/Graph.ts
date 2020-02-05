
import Command, { CommandTag } from './Command'
import parseCommand from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import SetOperation from './SetOperation'
import GetOperation from './GetOperation'
import GraphListener from './GraphListener'
import GraphListenerToCallback from './GraphListenerToCallback'
import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import collectRespond from './collectRespond'
import Schema from './Schema'
import StorageProvider from './StorageProvider'
import InMemoryStorage from './InMemoryStorage'
import FilesystemMounts from './FilesystemMounts'
import SavedQuery from './SavedQuery'
import StorageMount from './StorageMount'
import EagerValue from './EagerValue'
import updateFilesystemMounts from './updateFilesystemMounts'
import { UpdateFn } from './UpdateContext'

export type RespondFunc = (msg: string) => void
export type RunFunc = (query: string, respond: RespondFunc) => void

export default class Graph {

    inMemory = new InMemoryStorage()
    listeners: GraphListener[] = []

    savedQueries: SavedQuery[] = []
    savedQueryMap: { [queryStr:string]: SavedQuery } = {}

    schema = new Schema()
    filesystemMounts: FilesystemMounts
    filesystemMounts2: EagerValue<StorageMount[]>

    nextEagerValueId: number = 1

    constructor() {
        this.filesystemMounts = new FilesystemMounts(this)
        this.filesystemMounts2 = this.eagerValue<StorageMount[]>(updateFilesystemMounts);
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

    eagerValue<T>(updateFn: UpdateFn<T>): EagerValue<T> {
        const ev = new EagerValue<T>(this, updateFn);
        ev.runUpdate();
        return ev;
    }

    *iterateMounts() {
        if (this.filesystemMounts2) {
            const mounts = this.filesystemMounts2.get();
            for (const mount of mounts)
                yield mount;
        }
    }

    dump(command: Command, respond: RespondFunc) {
        respond('#start');

        for (const rel of this.inMemory.everyRelation()) {
            respond(this.schema.stringifyRelation(rel));
        }

        respond('#done');
    }

    deleteCmd(command: Command, respond: RespondFunc) {
        const pattern = command.toPattern();

        for (const rel of this.inMemory.findAllMatches(pattern)) {
            if (rel.includesType('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            this.inMemory.deleteRelation(rel);
            this.onRelationDeleted(rel);
        }

        respond('#done');
    }

    listen(command: Command, respond: RespondFunc) {
        respond('#start');

        if (command.flags.get) {
            const get = new GetOperation(this, command);
            get.outputToStringRespond(respond, formatter => {
                formatter.skipStartAndDone = true;
                formatter.asMultiResults = true;
                formatter.asSetCommands = true;
            });

            get.run();
        }

        const listener = new GraphListenerToCallback(this, command, respond);
        this.listeners.push(listener);
    }

    handleCommand(command: Command, respond: RespondFunc) {

        try {
            switch (command.command) {

            case 'set': {
                const set = new SetOperation(this, command, respond)
                set.run();
                return;
            }

            case 'get': {
                const get = new GetOperation(this, command);
                get.outputToStringRespond(respond);
                get.run();
                return;
            }

            case 'dump': {
                this.dump(command, respond);
                return;
            }

            case 'delete': {
                this.deleteCmd(command, respond);
                return;
            }

            case 'listen': {
                this.listen(command, respond);
                return;
            }
            
            }

            respond("#error unrecognized command: " + command.command);
        } catch (err) {
            console.log(err.stack || err);
            respond("#internal_error");
        }
    }

    onRelationUpdated(command: Command, rel: Relation) {
        this.schema.onRelationUpdated(command, rel);

        for (const listener of this.listeners)
            listener.onRelationUpdated(rel);

        for (const savedQuery of this.savedQueries) {
            if (savedQuery.pattern.matches(rel)) {
                savedQuery.changeToken += 1;
                savedQuery.updateConnectedValues();
            }
        }
    }

    onRelationDeleted(rel: Relation) {
        for (const listener of this.listeners)
            listener.onRelationDeleted(rel);

        for (const savedQuery of this.savedQueries) {
            if (savedQuery.pattern.matches(rel)) {
                savedQuery.changeToken += 1;
                savedQuery.updateConnectedValues();
            }
        }
    }

    run(commandStr: string, respond?: RespondFunc) {
        respond = respond || (() => null);
        const parsed = parseCommand(commandStr);
        this.handleCommand(parsed, respond);
    }

    runSync(commandStr: string) {
        let result = null;

        const collector = collectRespond(r => { result = r; });
        
        this.run(commandStr, collector);

        if (result === null)
            throw new Error("command didn't have sync response in runSync");

        return result;
    }

    relationPattern(commandStr: string) {
        const parsed = parseCommand(commandStr);
        return parsed.toPattern();
    }
}
