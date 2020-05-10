import TestRunner from './TestRunner';
export default class TestSuite {
    testRunners: TestRunner[];
    constructor();
    describe(name: string, impl: (context?: any) => void | Promise<any>): void;
    test: (name: string, impl: (context?: any) => void | Promise<any>) => void;
}
export declare function startSuite(): TestSuite;
