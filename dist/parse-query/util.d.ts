declare type Status = 'in-progress' | 'done-match' | 'done-fail';
export interface Matcher {
    getInitialState: () => any;
    advance: (state: any) => any;
    getStatus: (state: any) => Status;
    getResult: (state: any) => any;
}
export declare function runMatcher(items: any[], matcher: Matcher): any;
export declare function multimatcher(matchers: Matcher[]): Matcher;
export {};
