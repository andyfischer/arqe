"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Pattern_1 = __importDefault(require("./Pattern"));
const parseCommand_1 = require("./parseCommand");
const RelationReceiver_1 = require("./RelationReceiver");
const ChainedExecution_1 = require("./ChainedExecution");
const parseCommand_2 = require("./parseCommand");
class TagAPI {
    constructor(api, patternTag) {
        this.api = api;
        this.patternTag = patternTag;
    }
    add(tagStr) {
        const tag = parseCommand_2.parseTag(tagStr);
        return new RelationAPI(this.api, new Pattern_1.default([this.patternTag, tag]));
    }
    value() {
        return this.patternTag.tagValue;
    }
    str() {
        return this.patternTag.str();
    }
}
exports.TagAPI = TagAPI;
class CommandBuilderAPI {
    constructor(api) {
        this.commands = [];
        this.api = api;
    }
    pushCommandString(str) {
        this.commands.push(str);
    }
    rels() {
        const commandChainStr = this.commands.join(' | ');
        const commandChain = parseCommand_1.parseCommandChain(commandChainStr);
        return this.api.runCommandChain(commandChain);
    }
}
exports.CommandBuilderAPI = CommandBuilderAPI;
class RelationAPI {
    constructor(api, pattern) {
        this.api = api;
        this.pattern = pattern;
    }
    value() {
        return this.pattern.getValue();
    }
    tag(tagType) {
        return new TagAPI(this.api, this.pattern.getTagObject(tagType));
    }
    tagValue(tagType) {
        return this.pattern.getTagObject(tagType).tagValue;
    }
    get() {
        return this.api.get(this.pattern.str());
    }
    getOne() {
        return this.api.getOne(this.pattern.str());
    }
    join(joinSearch) {
        const builder = new CommandBuilderAPI(this.api);
        builder.pushCommandString('get ' + this.pattern.str());
        builder.pushCommandString('join ' + joinSearch);
        return builder;
    }
}
exports.RelationAPI = RelationAPI;
class GraphRelationSyncAPI {
    constructor(graph) {
        this.graph = graph;
    }
    runCommandChain(chain) {
        let rels = null;
        const output = RelationReceiver_1.receiveToRelationList(l => { rels = l; });
        ChainedExecution_1.runCommandChain(this.graph, chain, output);
        if (rels === null)
            throw new Error("Command didn't finish synchronously: " + chain.str());
        return rels
            .filter(rel => !rel.hasType('command-meta'))
            .map(rel => new RelationAPI(this, rel));
    }
    run(command) {
        const chain = parseCommand_1.parseCommandChain(command);
        return this.runCommandChain(chain);
    }
    pattern(pattern) {
        return new RelationAPI(this, parseCommand_1.parsePattern(pattern));
    }
    get(pattern) {
        return this.run('get ' + pattern);
    }
    getOne(pattern) {
        const rels = this.get(pattern);
        if (rels.length === 0)
            throw new Error("getOne didn't find any relations for: " + pattern);
        if (rels.length > 1)
            throw new Error("getOne found multple relations for: " + pattern);
        return rels[0];
    }
}
exports.default = GraphRelationSyncAPI;
//# sourceMappingURL=GraphRelationSyncAPI.js.map