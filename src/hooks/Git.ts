
import Graph from '../Graph'
import { emitCommandError } from '../CommandMeta'
import Relation from '../Relation'
import RelationReceiver from '../RelationReceiver'
import Pattern from '../Pattern'
import StorageSlotHook  from '../StorageSlotHook'
import Slot from '../Slot'
import SlotReceiver from '../SlotReceiver'

import ChildProcess from 'child_process'

/*
function runSearch(search: SearchOperation) {
    
}

function runSave(save: SaveOperation) {
}
*/

class GitHooks implements StorageSlotHook {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    hookPattern(pattern: Pattern) {
        return pattern.hasType('git') && pattern.hasType('branch') && pattern.hasType('dir');
    }

    saveNewRelation(relation: Relation, output: RelationReceiver) {
    }

    iterateSlots(pattern: Pattern, output: SlotReceiver) {
        const dir = pattern.getTagObject('dir');
        const branch = pattern.getTagObject('branch');

        if (dir.starValue) {
            emitCommandError(output.relationOutput, `can't use dir(*)`);
            return true;
        }

        ChildProcess.exec('git branch --list', {
            cwd: dir.tagValue
        }, (error, stdout, stderr) => {
            
            if (error) {
                emitCommandError(output.relationOutput, error.toString());
                output.finish();
                return;
            }

            const lines = stdout.split('\n');

            for (let line of lines) {
                line = line.slice(2);

                if (!line || line === '')
                    continue;

                const relation = pattern.updateTagOfType('branch', tag => tag.setValue(line));

                output.slot({
                    relation,
                    modify: (func: (rel: Pattern) => Pattern) => {
                        const modified = func(relation);
                        if (modified.hasType('deleted')) {
                            console.log('deleting branch: ' + modified.getTagValue('branch'));
                            ChildProcess.exec('git branch -D ' + modified.getTagValue('branch'), {
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

    /*
    hookSave(save: SaveOperation) {
        const { relation } = save;

        if () {
            runSave(save);
            return;
        }

        return false;
    }

    hookSearch(search: SearchOperation) {
        const { pattern } = search;

        if (pattern.hasType('git') && pattern.hasType('branch') && pattern.hasType('dir')) {
            runSearch(search)
            return true;
        }

        return false;
    }
    */
}

export default function setupGitHooks(graph: Graph) {
    return new GitHooks(graph);
}
