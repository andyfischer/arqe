import CommandConnection from '../socket/CommandConnection';
export declare type TestCase = (session: TestSession) => Promise<void>;
export declare class TestSuite {
    conn: CommandConnection;
    runAll(cases: TestCase[]): Promise<void>;
    runOneCase(testCase: TestCase, options: any): Promise<TestSession>;
}
export declare class TestSession {
    conn: CommandConnection;
    lastResult: any;
    consoleLog: boolean;
    failed: boolean;
    log(msg: string): void;
    fail(msg: string): void;
    command(cmd: string): Promise<string>;
    setup(): Promise<void>;
    runSteps(steps: string[]): Promise<void>;
    runScript(script: string): Promise<void>;
}
