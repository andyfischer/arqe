import Relation from './Relation';
import LiveSearch from './LiveSearch';
import FindExtResult from './FindExtResult';
export default class Graph {
    parent?: Graph;
    relations: {
        [key: string]: Relation;
    };
    searches: {
        [pattern: string]: LiveSearch;
    };
    constructor(parent?: Graph);
    del(pattern: string): void;
    insert(key: string, value?: any): void;
    exists(key: string): boolean;
    findOne(key: string, defaultValue: any): any;
    find(pattern: string): any[];
    findExt(pattern: string): FindExtResult[];
    findAsObject(pattern: string): any;
}
