import SaveSearchHook from './SaveSearchHook';
import SaveOperation from './SaveOperation';
import SearchOperation from './SearchOperation';
export declare function hookObjectSpaceSearch(search: SearchOperation): boolean;
export declare function hookObjectSpaceSave(save: SaveOperation): boolean;
export declare function getObjectSpaceHooks(): SaveSearchHook;
