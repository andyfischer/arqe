import { Snapshot } from '../framework';
import QuerySyntax from '../parse-query/QuerySyntax';
import QueryResult from './QueryResult';
declare type QueryType = 'command' | 'relation' | 'unknown' | 'empty';
export default interface Query {
    syntax: QuerySyntax;
    type: QueryType;
    options: {
        [key: string]: string;
    };
    args?: string[];
    isIncomplete?: boolean;
    command?: string;
    relationSubject?: string;
    relation?: string;
    snapshot?: Snapshot;
    isInteractive?: boolean;
    get?: (name: string) => any;
    getOptional?: (name: string, defaultValue: any) => any;
    subQuery?: (str: string) => Promise<QueryResult>;
    respond?: (data: any) => void;
    promise?: Promise<any>;
}
export {};
