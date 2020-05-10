"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("./parseCommand"));
const SetOperation_1 = __importDefault(require("./SetOperation"));
const GetOperation_1 = __importDefault(require("./GetOperation"));
const GraphListenerToCallback_1 = __importDefault(require("./GraphListenerToCallback"));
const collectRespond_1 = __importDefault(require("./collectRespond"));
const Schema_1 = __importDefault(require("./Schema"));
const InMemoryStorage_1 = __importDefault(require("./InMemoryStorage"));
const SavedQuery_1 = __importDefault(require("./SavedQuery"));
const EagerValue_1 = __importDefault(require("./EagerValue"));
const updateFilesystemMounts_1 = __importDefault(require("./updateFilesystemMounts"));
const InheritTags_1 = __importStar(require("./InheritTags"));
const TypeInfo_1 = __importDefault(require("./TypeInfo"));
const GraphContext_1 = __importDefault(require("./GraphContext"));
const WebSocketSync_1 = require("./WebSocketSync");
class Graph {
    constructor() {
        this.inMemory = new InMemoryStorage_1.default();
        this.listeners = [];
        this.savedQueries = [];
        this.savedQueryMap = {};
        this.schema = new Schema_1.default();
        this.typeInfo = {};
        this.nextEagerValueId = 1;
        this.filesystemMounts = this.eagerValue(updateFilesystemMounts_1.default);
        this.inheritTags = this.eagerValue(InheritTags_1.updateInheritTags, new InheritTags_1.default());
        this.eagerValue(this.schema.ordering.update);
        this.wsSyncs = this.eagerValue(WebSocketSync_1.updateWebSocketSyncs);
        // this.run('set wstest tag-definition provider/wssync')
    }
    context(query) {
        const cxt = new GraphContext_1.default(this);
        cxt.run('context ' + query, () => null);
        return cxt;
    }
    savedQuery(queryStr) {
        if (this.savedQueryMap[queryStr])
            return this.savedQueryMap[queryStr];
        if (this.savedQueries.length == 100)
            console.log('warning: more than 100 saved queries');
        const query = new SavedQuery_1.default(this, this.savedQueries.length, queryStr);
        this.savedQueries.push(query);
        this.savedQueryMap[queryStr] = query;
        return query;
    }
    eagerValue(updateFn, initialValue) {
        const ev = new EagerValue_1.default(this, updateFn, initialValue);
        ev.runUpdate();
        return ev;
    }
    *iterateMounts() {
        if (this.filesystemMounts) {
            const mounts = this.filesystemMounts.get();
            for (const mount of mounts)
                yield mount;
        }
    }
    getTypeInfo(name) {
        if (!this.typeInfo[name]) {
            this.typeInfo[name] = new TypeInfo_1.default();
        }
        return this.typeInfo[name];
    }
    dump(command, respond) {
        respond('#start');
        for (const rel of this.inMemory.everyRelation()) {
            respond(this.schema.stringifyRelation(rel));
        }
        respond('#done');
    }
    deleteCmd(command, respond) {
        const pattern = command.toPattern();
        for (const rel of this.inMemory.findAllMatches(pattern)) {
            if (rel.includesType('typeinfo'))
                throw new Error("can't delete a typeinfo relation");
            this.inMemory.deleteRelation(rel);
            this.onRelationDeleted(rel);
        }
        respond('#done');
    }
    listen(command, respond) {
        respond('#start');
        if (command.flags.get) {
            const get = new GetOperation_1.default(this, command);
            get.outputToStringRespond(respond, formatter => {
                formatter.skipStartAndDone = true;
                formatter.asMultiResults = true;
                formatter.asSetCommands = true;
            });
            get.run();
        }
        const listener = new GraphListenerToCallback_1.default(this, command, respond);
        this.listeners.push(listener);
    }
    runParsed(command, respond) {
        try {
            switch (command.command) {
                case 'set': {
                    const set = new SetOperation_1.default(this, command, respond);
                    set.run();
                    return;
                }
                case 'get': {
                    const get = new GetOperation_1.default(this, command);
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
        }
        catch (err) {
            console.log(err.stack || err);
            respond("#internal_error");
        }
    }
    onRelationUpdated(command, rel) {
        for (const listener of this.listeners)
            listener.onRelationUpdated(rel);
        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.matches(rel);
            if (!matches)
                continue;
            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
    }
    onRelationDeleted(rel) {
        for (const listener of this.listeners)
            listener.onRelationDeleted(rel);
        for (const savedQuery of this.savedQueries) {
            if (savedQuery.pattern.matches(rel)) {
                savedQuery.changeToken += 1;
                savedQuery.updateConnectedValues();
            }
        }
    }
    run(commandStr, respond) {
        if (!respond) {
            respond = (msg) => {
                if (msg.startsWith('#error')) {
                    console.log(`Uncaught error when running '${commandStr}': ${msg}`);
                }
            };
        }
        const parsed = parseCommand_1.default(commandStr);
        this.runParsed(parsed, respond);
    }
    runSync(commandStr) {
        let result = null;
        const collector = collectRespond_1.default(r => { result = r; });
        this.run(commandStr, collector);
        if (result === null)
            throw new Error("command didn't have sync response in runSync");
        return result;
    }
    relationPattern(commandStr) {
        const parsed = parseCommand_1.default(commandStr);
        return parsed.toPattern();
    }
}
exports.default = Graph;
