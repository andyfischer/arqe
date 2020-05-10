"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandMeta_1 = require("../CommandMeta");
const child_process_1 = __importDefault(require("child_process"));
class GitHooks {
    constructor(graph) {
        this.graph = graph;
    }
    hookPattern(pattern) {
        return pattern.hasType('git') && pattern.hasType('branch') && pattern.hasType('dir');
    }
    saveNewRelation(relation, output) {
    }
    iterateSlots(pattern, output) {
        const dir = pattern.getTagObject('dir');
        const branchTag = pattern.getTagObject('branch');
        if (dir.starValue) {
            CommandMeta_1.emitCommandError(output.relationOutput, `can't use dir(*)`);
            return true;
        }
        child_process_1.default.exec('git branch --list', {
            cwd: dir.tagValue
        }, (error, stdout, stderr) => {
            if (error) {
                CommandMeta_1.emitCommandError(output.relationOutput, error.toString());
                output.finish();
                return;
            }
            const lines = stdout.split('\n');
            for (let line of lines) {
                line = line.slice(2);
                if (!line || line === '')
                    continue;
                const branchName = line;
                if (!branchTag.starValue && branchTag.tagValue !== branchName)
                    continue;
                const relation = pattern.updateTagOfType('branch', tag => tag.setValue(branchName));
                output.slot({
                    relation,
                    modify: (func) => {
                        const modified = func(relation);
                        if (modified.hasType('deleted')) {
                            console.log('deleting branch: ' + modified.getTagValue('branch'));
                            child_process_1.default.exec('git branch -D ' + modified.getTagValue('branch'), {
                                cwd: dir.tagValue
                            }, (error, stdout, stderr) => {
                                console.log(error);
                            });
                        }
                        return modified;
                    }
                });
            }
            output.finish();
        });
    }
}
function setupGitHooks(graph) {
    return new GitHooks(graph);
}
exports.default = setupGitHooks;
//# sourceMappingURL=Git.js.map