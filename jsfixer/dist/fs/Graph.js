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
const fs_1 = __importDefault(require("fs"));
const parseCommand_1 = require("./parseCommand");
const InMemoryStorage_1 = __importDefault(require("./InMemoryStorage"));
const SavedQuery_1 = __importDefault(require("./SavedQuery"));
const EagerValue_1 = __importDefault(require("./EagerValue"));
const updateFilesystemMounts_1 = __importDefault(require("./updateFilesystemMounts"));
const InheritTags_1 = __importStar(require("./InheritTags"));
const TypeInfo_1 = __importDefault(require("./TypeInfo"));
const WebSocketProvider_1 = require("./WebSocketProvider");
const receivers_1 = require("./receivers");
const runCommand_1 = require("./runCommand");
const UpdateContext_1 = __importDefault(require("./UpdateContext"));
const TagTypeOrdering_1 = __importDefault(require("./TagTypeOrdering"));
const runningInBrowser_1 = __importDefault(require("./context/runningInBrowser"));
const IDSource_1 = __importDefault(require("./utils/IDSource"));
const receiveToStringList_1 = __importDefault(require("./receiveToStringList"));
const ObjectSpace_1 = require("./ObjectSpace");
const parseCommand_2 = require("./parseCommand");
const watchAndValidateCommand_1 = __importDefault(require("./watchAndValidateCommand"));
const ExpireAtListener_1 = __importDefault(require("./ExpireAtListener"));
class Graph {
    constructor() {
        this.inMemory = new InMemoryStorage_1.default(this);
        this.objectTypes = new ObjectSpace_1.ObjectTypeSpace(this);
        this.listeners = [];
        this.savedQueries = [];
        this.savedQueryMap = {};
        this.ordering = new TagTypeOrdering_1.default();
        this.typeInfo = {};
        this.derivedValueMounts = [];
        this.eagerValueIds = new IDSource_1.default();
        this.graphListenerIds = new IDSource_1.default();
        if (runningInBrowser_1.default())
            this.filesystemMounts = this.eagerValue(() => []);
        else
            this.filesystemMounts = this.eagerValue(updateFilesystemMounts_1.default);
        this.inheritTags = this.eagerValue(InheritTags_1.updateInheritTags, new InheritTags_1.default());
        this.eagerValue(this.ordering.update);
        this.wsProviders = this.eagerValue(WebSocketProvider_1.updateWebSocketProviders);
        this.addListener(parseCommand_2.parsePattern('object-type/* **'), this.objectTypes);
        this.addListener(parseCommand_2.parsePattern('expires-at/* **'), new ExpireAtListener_1.default(this));
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
        for (const mount of this.derivedValueMounts)
            yield mount;
    }
    getTypeInfo(name) {
        if (!this.typeInfo[name]) {
            this.typeInfo[name] = new TypeInfo_1.default();
        }
        return this.typeInfo[name];
    }
    addListener(pattern, listener) {
        this.listeners.push({ pattern, listener });
    }
    onRelationUpdated(rel) {
        for (const entry of this.listeners) {
            if (entry.pattern.matches(rel)) {
                entry.listener.onRelationUpdated(rel);
            }
            else {
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
    onRelationDeleted(rel) {
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
    run(commandStr, output) {
        if (/^ *\#/.exec(commandStr)) {
            return;
        }
        if (!output) {
            output = receivers_1.fallbackReceiver(commandStr);
        }
        output = watchAndValidateCommand_1.default(commandStr, output);
        const chain = parseCommand_1.parseCommandChain(commandStr);
        runCommand_1.runCommandChain(this, chain, output);
    }
    runSyncOld(commandStr) {
        let result = null;
        const receiver = receiveToStringList_1.default(r => { result = r; });
        this.run(commandStr, receiver);
        if (result === null)
            throw new Error("command didn't have sync response in runSync");
        return result;
    }
    runSync(commandStr) {
        return this.runCommandChainSync(commandStr);
    }
    runCommandChainSync(commandStr) {
        const chain = parseCommand_1.parseCommandChain(commandStr);
        let rels = null;
        const receiver = receivers_1.receiveToRelationList(r => {
            rels = r;
        });
        runCommand_1.runCommandChain(this, chain, receiver);
        if (rels === null)
            throw new Error("command didn't finish synchronously: " + commandStr);
        return rels;
    }
    runDerived(callback) {
        const cxt = new UpdateContext_1.default(this);
        return callback(cxt);
    }
    loadDumpFile(filename) {
        const contents = fs_1.default.readFileSync(filename, 'utf8');
        for (const line of contents.split(/\r\n|\r|\n/)) {
            if (line.trim() === '')
                continue;
            try {
                this.run(line);
            }
            catch (e) {
                console.log('Failed on command: ' + line);
            }
        }
    }
    loadDump(contents) {
        for (const line of contents.split(/\r\n|\r|\n/)) {
            this.run(line);
        }
    }
    saveDumpFile(filename) {
        const contents = this.runSyncOld('dump').join('\n');
        fs_1.default.writeFileSync(filename, contents);
    }
    static loadFromDumpFile(filename) {
        const graph = new Graph();
        graph.loadDumpFile(filename);
        return graph;
    }
    close() {
    }
}
exports.default = Graph;
//# sourceMappingURL=Graph.js.map