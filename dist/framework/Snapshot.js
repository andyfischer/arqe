"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandDatabase_1 = require("../types/CommandDatabase");
const RelationDatabase_1 = require("../types/RelationDatabase");
const query_watchers_1 = require("../query-watchers");
const commands_1 = require("../commands");
const scope_1 = require("../scope");
const setupBuiltinSlots_1 = __importDefault(require("../scope/setupBuiltinSlots"));
const MissingValue = Symbol('missing');
class Snapshot {
    constructor() {
        this.typeSnapshot = true;
        this.commandImplementations = {};
        this.queryWatchers = [];
        const graph = new scope_1.Graph();
        this.globalScope = new scope_1.Scope(graph);
        this.fileScope = new scope_1.Scope(graph);
        setupBuiltinSlots_1.default(this.globalScope);
        this.globalScope.set('commandDatabase', CommandDatabase_1.getZeroCommandDatabase());
        this.globalScope.set('relationDatabase', RelationDatabase_1.getZeroRelationDatabase());
        query_watchers_1.mountEveryQueryWatcher(this);
        commands_1.implementEveryCommand(this);
    }
    modifyGlobal(name, modifier) {
        this.globalScope.modify(name, modifier);
    }
    isRelation(s) {
        const relations = this.getValue('relations');
        return !!relations[s];
    }
    isCommand(s) {
        const db = CommandDatabase_1.getCommandDatabase(this);
        return !!db.byName[s];
    }
    getLastIncompleteClause() {
        return this.getValueOpt('lastIncompleteClause', null);
    }
    getValueOpt(name, defaultValue) {
        let found = this.fileScope.getOptional(name, MissingValue);
        if (found !== MissingValue)
            return found;
        found = this.globalScope.getOptional(name, MissingValue);
        if (found !== MissingValue)
            return found;
        return defaultValue;
    }
    getValue(name) {
        const get = this.getValueOpt(name, MissingValue);
        if (get === MissingValue)
            throw new Error('value not found for: ' + name);
        return get;
    }
    implementCommand(name, impl) {
        this.commandImplementations[name] = impl;
    }
    implement(name, impl) {
        this.commandImplementations[name] = impl;
    }
    mountQueryWatcher(name, watcher) {
        this.queryWatchers.push(watcher);
    }
}
exports.default = Snapshot;
//# sourceMappingURL=Snapshot.js.map