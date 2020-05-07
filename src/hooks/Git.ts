
import Graph from '../Graph'
import SaveSearchHook from '../SaveSearchHook'
import SaveOperation from '../SaveOperation'
import SearchOperation from '../SearchOperation'

class GitHooks implements SaveSearchHook {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    hookSave(save: SaveOperation) {
        return false;
    }

    hookSearch(search: SearchOperation) {
        return false;
    }
}

export default function setupGitHooks(graph: Graph) {
    return new GitHooks(graph);
}
