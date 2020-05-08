
import Graph from '../Graph'
import { emitCommandError } from '../CommandMeta'
import Relation from '../Relation'
import RelationReceiver from '../RelationReceiver'
import Pattern from '../Pattern'
import StorageSlotHook, { Slot }  from '../StorageSlotHook'

import ChildProcess from 'child_process'

/*
function runSearch(search: SearchOperation) {
    const { pattern } = search;

    const dir = pattern.getTagObject('dir');
    const branch = pattern.getTagObject('branch');

    if (dir.starValue) {
        emitCommandError(search, `can't use dir(*)`);
        return true;
    }

    ChildProcess.exec('git branch --list', {
        cwd: dir.tagValue
    }, (error, stdout, stderr) => {
        
        if (error) {
            emitCommandError(search, error.toString());
            search.finish();
            return;
        }

        const lines = stdout.split('\n');

        for (let line of lines) {

            line = line.slice(2);
            search.relation(pattern.updateTagOfType('branch', tag => tag.setValue(line)));
        }

        search.finish();
    });
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

    *iterateSlots(pattern: Pattern): Iterable<Slot> {
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
