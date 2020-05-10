"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agents_1 = __importDefault(require("./agents"));
const cd_1 = __importDefault(require("./cd"));
const create_working_dir_1 = __importDefault(require("./create-working-dir"));
const def_function_1 = __importDefault(require("./def-function"));
const def_relation_1 = __importDefault(require("./def-relation"));
const def_slot_1 = __importDefault(require("./def-slot"));
const def_type_1 = __importDefault(require("./def-type"));
const define_toggle_1 = __importDefault(require("./define-toggle"));
const deploy_1 = __importDefault(require("./deploy"));
const dir_snapshots_1 = __importDefault(require("./dir-snapshots"));
const encode_file_1 = __importDefault(require("./encode-file"));
const env_1 = __importDefault(require("./env"));
const find_relations_1 = __importDefault(require("./find-relations"));
const fix_errors_from_tsc_1 = __importDefault(require("./fix-errors-from-tsc"));
const git_checkout_1 = __importDefault(require("./git-checkout"));
const help_1 = __importDefault(require("./help"));
const ls_1 = __importDefault(require("./ls"));
const npm_list_installed_1 = __importDefault(require("./npm-list-installed"));
const set_in_current_file_1 = __importDefault(require("./set-in-current-file"));
const set_1 = __importDefault(require("./set"));
const show_commands_1 = __importDefault(require("./show-commands"));
const spawn_discovery_agent_if_needed_1 = __importDefault(require("./spawn-discovery-agent-if-needed"));
const that_should_work_1 = __importDefault(require("./that-should-work"));
const timedate_1 = __importDefault(require("./timedate"));
const watch_1 = __importDefault(require("./watch"));
function implementEveryCommand(snapshot) {
    agents_1.default(snapshot);
    cd_1.default(snapshot);
    create_working_dir_1.default(snapshot);
    def_function_1.default(snapshot);
    def_relation_1.default(snapshot);
    def_slot_1.default(snapshot);
    def_type_1.default(snapshot);
    define_toggle_1.default(snapshot);
    deploy_1.default(snapshot);
    dir_snapshots_1.default(snapshot);
    encode_file_1.default(snapshot);
    env_1.default(snapshot);
    find_relations_1.default(snapshot);
    fix_errors_from_tsc_1.default(snapshot);
    git_checkout_1.default(snapshot);
    help_1.default(snapshot);
    ls_1.default(snapshot);
    npm_list_installed_1.default(snapshot);
    set_in_current_file_1.default(snapshot);
    set_1.default(snapshot);
    show_commands_1.default(snapshot);
    spawn_discovery_agent_if_needed_1.default(snapshot);
    that_should_work_1.default(snapshot);
    timedate_1.default(snapshot);
    watch_1.default(snapshot);
}
exports.implementEveryCommand = implementEveryCommand;
//# sourceMappingURL=index.js.map