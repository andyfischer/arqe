
import GitStorageAPI from './generated/GitStorageAPI'

export function setupGitProvider() {
    return new GitStorageAPI({
        createBranch(dir: string, branchName: string) {
        },
        listBranches(dir: string) {
            return [];
        },
        checkBranchExists(dir: string) {
            return false;
        },
        deleteBranch(dir: string, branchName: string) {
        }
    });
}

/*
import Graph from '../Graph'
import { emitCommandError } from '../CommandMeta'
import Relation from '../Relation'
import RelationReceiver from '../RelationReceiver'
import Pattern from '../Pattern'
import Slot from '../Slot'
import SlotReceiver from '../SlotReceiver'

import ChildProcess from 'child_process'

export default class GitHooks {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    // called for: set git dir/$dir branch/$name 
    async createBranch(dir: string, branchName: string) {
    }

    // called for: get git dir/$dir branch/*
    async listBranches(dir: string): Promise<string[]> {
        return [];
    }

    // called for: get git dir/$dir branch/$branch 
    async checkBranchExists(dir: string): Promise<boolean> {
        return false;
    }

    // called for: delete git dir/$dir branch/$branch
    async deleteBranch(dir: string, branchName: string) {
    }

    useForPattern(pattern: Pattern) {
        return pattern.hasType('git') && pattern.hasType('branch') && pattern.hasType('dir');
    }

    saveNewRelation2(relation: Relation) {
    }

    getRelations(pattern: Pattern, output: RelationReceiver) {
        const dir = pattern.getTagObject('dir');
        const branchTag = pattern.getTagObject('branch');

        if (dir.starValue) {
            emitCommandError(output, `can't use dir(*)`);
            return true;
        }

        ChildProcess.exec('git branch --list', {
            cwd: dir.tagValue
        }, (error, stdout, stderr) => {
            
            if (error) {
                emitCommandError(output, error.toString());
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

                output.relation(relation);

                    / *
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
                    * /
            }

            output.finish();
        });
    }
}
*/