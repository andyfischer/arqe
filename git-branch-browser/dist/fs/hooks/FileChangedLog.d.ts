import SaveSearchHook from '../SaveSearchHook';
import SearchOperation from '../SearchOperation';
import Graph from '../Graph';
import SaveOperation from '../SaveOperation';
export default class FileChangedLog implements SaveSearchHook {
    graph: Graph;
    constructor(graph: Graph);
    hookSearch(search: SearchOperation): boolean;
    hookSave(save: SaveOperation): boolean;
}
