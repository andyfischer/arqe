"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrapScripts_1 = __importDefault(require("./bootstrapScripts"));
const commandDatabase_1 = __importDefault(require("./commandDatabase"));
const file_scope_1 = __importDefault(require("./file-scope"));
const growRelationDatabase_1 = __importDefault(require("./growRelationDatabase"));
const invalidQueryCheck_1 = __importDefault(require("./invalidQueryCheck"));
const lastIncompleteClause_1 = __importDefault(require("./lastIncompleteClause"));
const lastQueryStr_1 = __importDefault(require("./lastQueryStr"));
const saveAutocompleteStrings_1 = __importDefault(require("./saveAutocompleteStrings"));
const tracer_1 = __importDefault(require("./tracer"));
const writeFactsToLog_1 = __importDefault(require("./writeFactsToLog"));
function mountEveryQueryWatcher(snapshot) {
    snapshot.mountQueryWatcher('bootstrapScripts', bootstrapScripts_1.default);
    snapshot.mountQueryWatcher('commandDatabase', commandDatabase_1.default);
    snapshot.mountQueryWatcher('file-scope', file_scope_1.default);
    snapshot.mountQueryWatcher('growRelationDatabase', growRelationDatabase_1.default);
    snapshot.mountQueryWatcher('invalidQueryCheck', invalidQueryCheck_1.default);
    snapshot.mountQueryWatcher('lastIncompleteClause', lastIncompleteClause_1.default);
    snapshot.mountQueryWatcher('lastQueryStr', lastQueryStr_1.default);
    snapshot.mountQueryWatcher('saveAutocompleteStrings', saveAutocompleteStrings_1.default);
    snapshot.mountQueryWatcher('tracer', tracer_1.default);
    snapshot.mountQueryWatcher('writeFactsToLog', writeFactsToLog_1.default);
}
exports.mountEveryQueryWatcher = mountEveryQueryWatcher;
//# sourceMappingURL=index.js.map