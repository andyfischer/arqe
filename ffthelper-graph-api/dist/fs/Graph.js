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
const CommandExecution_1 = __importDefault(require("./CommandExecution"));
const parseCommand_1 = __importStar(require("./parseCommand"));
const SetOperation_1 = __importDefault(require("./SetOperation"));
const Search_1 = require("./Search");
const collectRespond_1 = __importDefault(require("./collectRespond"));
const InMemoryStorage_1 = __importDefault(require("./InMemoryStorage"));
const SavedQuery_1 = __importDefault(require("./SavedQuery"));
const EagerValue_1 = __importDefault(require("./EagerValue"));
const updateFilesystemMounts_1 = __importDefault(require("./updateFilesystemMounts"));
const InheritTags_1 = __importStar(require("./InheritTags"));
const TypeInfo_1 = __importDefault(require("./TypeInfo"));
const GraphContext_1 = __importDefault(require("./GraphContext"));
const WebSocketProvider_1 = require("./WebSocketProvider");
const RelationReceiver_1 = require("./RelationReceiver");
const ChainedExecution_1 = require("./ChainedExecution");
const CommandMeta_1 = require("./CommandMeta");
const stringifyQuery_1 = require("./stringifyQuery");
const UpdateContext_1 = __importDefault(require("./UpdateContext"));
const fs_1 = __importDefault(require("fs"));
const ClientRepl_1 = __importDefault(require("./cli/ClientRepl"));
const TagTypeOrdering_1 = __importDefault(require("./TagTypeOrdering"));
const GraphRelationSyncAPI_1 = __importDefault(require("./GraphRelationSyncAPI"));
class Graph {
    constructor() {
        this.inMemory = new InMemoryStorage_1.default();
        this.listeners = [];
        this.savedQueries = [];
        this.savedQueryMap = {};
        this.ordering = new TagTypeOrdering_1.default();
        this.typeInfo = {};
        this.derivedValueMounts = [];
        this.nextEagerValueId = 1;
        this.filesystemMounts = this.eagerValue(updateFilesystemMounts_1.default);
        this.inheritTags = this.eagerValue(InheritTags_1.updateInheritTags, new InheritTags_1.default());
        this.eagerValue(this.ordering.update);
        this.wsProviders = this.eagerValue(WebSocketProvider_1.updateWebSocketProviders);
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
        for (const mount of this.derivedValueMounts)
            yield mount;
    }
    getTypeInfo(name) {
        if (!this.typeInfo[name]) {
            this.typeInfo[name] = new TypeInfo_1.default();
        }
        return this.typeInfo[name];
    }
    deleteCmd(commandExec) {
        const pattern = commandExec.pattern;
        for (const rel of this.inMemory.findAllMatches(pattern)) {
            if (rel.hasType('typeinfo'))
                throw new Error("can't delete a typeinfo relation");
            rel.wasDeleted = true;
            this.inMemory.deleteRelation(rel);
            this.onRelationDeleted(rel);
        }
        commandExec.output.start();
        commandExec.output.finish();
    }
    listen(commandExec) {
        commandExec.output.start();
        if (commandExec.flags.get) {
            const search = commandExec.toRelationSearch();
            search.finish = () => null;
            Search_1.runSearch(this, search);
        }
        this.listeners.push({
            onRelationUpdated(rel) {
                if (commandExec.pattern.matches(rel)) {
                    commandExec.output.relation(rel);
                }
            },
            onRelationDeleted(rel) {
                if (!rel.wasDeleted) {
                    throw new Error('onRelationDeleted called but rel.wasDeleted is false');
                }
                if (commandExec.pattern.matches(rel)) {
                    commandExec.output.relation(rel);
                }
            },
            finish() {
                commandExec.output.finish();
            }
        });
    }
    relationSyncApi() {
        return new GraphRelationSyncAPI_1.default(this);
    }
    runCommandExecution(commandExec) {
        if (commandExec.start) {
            commandExec.start();
            return;
        }
        try {
            switch (commandExec.commandName) {
                case 'set': {
                    const set = new SetOperation_1.default(this, commandExec);
                    set.run();
                    return;
                }
                case 'get': {
                    const search = commandExec.toRelationSearch();
                    search.start();
                    CommandMeta_1.emitSearchPatternMeta(commandExec.command.toPattern(), search);
                    Search_1.runSearch(this, search);
                    return;
                }
                case 'dump': {
                    commandExec.output.start();
                    for (const rel of this.inMemory.everyRelation()) {
                        commandExec.output.relation(rel);
                    }
                    commandExec.output.finish();
                    return;
                }
                case 'delete': {
                    this.deleteCmd(commandExec);
                    return;
                }
                case 'listen': {
                    this.listen(commandExec);
                    return;
                }
                case 'join': {
                    // handled in setupCommandExecution
                    return;
                }
            }
            CommandMeta_1.emitCommandError(commandExec.output, "#error unrecognized command: " + commandExec.commandName);
        }
        catch (err) {
            console.log(err.stack || err);
            CommandMeta_1.emitCommandError(commandExec.output, "internal error: " + (err.stack || err));
        }
    }
    runCommandParsed(command, respond) {
        // Maybe divert to socket
        const wsProviders = this.wsProviders && this.wsProviders.get();
        if (wsProviders) {
            for (const provider of wsProviders) {
                if (provider.pattern.isSupersetOf(command.toPattern())) {
                    provider.handle(command, respond);
                    return;
                }
            }
        }
        const commandExec = new CommandExecution_1.default(this, command);
        commandExec.outputToStringRespond(respond);
        this.runCommandExecution(commandExec);
    }
    runCommandChainParsed(chain, respond) {
        if (chain.commands.length === 0) {
            respond('#done');
            return;
        }
        if (chain.commands.length === 1)
            return this.runCommandParsed(chain.commands[0], respond);
        const output = RelationReceiver_1.receiveToStringRespond(this, chain.commands[0], respond);
        ChainedExecution_1.runCommandChain(this, chain, output);
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
    run(str, respond) {
        if (!respond) {
            respond = (msg) => {
                if (msg.startsWith('#error')) {
                    console.log(`Uncaught error when running '${str}': ${msg}`);
                }
            };
        }
        const chain = parseCommand_1.parseCommandChain(str);
        for (const command of chain.commands) {
            if (!command.commandName)
                throw new Error('no command name found: ' + stringifyQuery_1.parsedCommandToString(command));
        }
        this.runCommandChainParsed(chain, respond);
    }
    runSync(commandStr) {
        let result = null;
        const collector = collectRespond_1.default(r => { result = r; });
        this.run(commandStr, collector);
        if (result === null)
            throw new Error("command didn't have sync response in runSync");
        return result;
    }
    runAsync(commandStr) {
        return new Promise(resolve => {
            const collector = collectRespond_1.default(resolve);
            this.run(commandStr, collector);
        });
    }
    relationPattern(commandStr) {
        const parsed = parseCommand_1.default(commandStr);
        return parsed.toPattern();
    }
    getRelationsSync(tags) {
        let rels = null;
        const commandStr = 'get ' + tags;
        const parsedCommand = parseCommand_1.default(commandStr);
        const commandExec = new CommandExecution_1.default(this, parsedCommand);
        commandExec.outputToRelationList(l => { rels = l; });
        const search = commandExec.toRelationSearch();
        search.start();
        Search_1.runSearch(this, search);
        if (rels === null)
            throw new Error("getRelationsSync search didn't finish synchronously: " + tags);
        return rels;
    }
    runDerived(callback) {
        const cxt = new UpdateContext_1.default(this);
        return callback(cxt);
    }
    loadDumpFile(filename) {
        const contents = fs_1.default.readFileSync(filename, 'utf8');
        for (const line of contents.split(/\r\n|\r|\n/)) {
            this.run(line);
        }
        /*
        const fileStream = Fs.createReadStream(filename);

        const rl = Readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });
      
        for await (const line of rl) {
            this.run(line);
        }
        */
    }
    saveDumpFile(filename) {
        const contents = this.runSync('dump').join('\n');
        fs_1.default.writeFileSync(filename, contents);
    }
    startRepl() {
        const repl = new ClientRepl_1.default(this);
        repl.start();
        return repl;
    }
}
exports.default = Graph;
