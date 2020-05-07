
import Graph from '../Graph'
import SaveSearchHook from '../SaveSearchHook'
import SaveOperation from '../SaveOperation'
import SearchOperation from '../SearchOperation'
import { emitCommandError } from '../CommandMeta'

class GitHooks implements SaveSearchHook {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    hookSave(save: SaveOperation) {
        return false;
    }

    hookSearch(search: SearchOperation) {
        const { pattern } = search;

        if (pattern.hasType('git') && pattern.hasType('branch') && pattern.hasType('dir')) {
            const dir = pattern.getTagObject('dir');
            const branch = pattern.getTagObject('branch');

            if (dir.starValue) {
                emitCommandError(search, `can't use dir(*)`);
                return true;
            }

        }

        return false;
    }
}

export default function setupGitHooks(graph: Graph) {
    return new GitHooks(graph);
}
