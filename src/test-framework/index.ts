
import CommandConnection from '../tags-db/CommandConnection'
import { parseAsSave } from '../tags-db/parseCommand'

export type TestCase = (session: TestSession) => Promise<void>

export class TestSuite {
    conn: CommandConnection

    async runAll(cases: TestCase[]) {

        let testCount = 0;
        const failed: TestCase[] = [];

        for (const testCase of cases) {
            testCount += 1;
            const session = await this.runOneCase(testCase, {});

            if (session.failed)
                failed.push(testCase);
        }

        if (failed.length === 0) {
            console.log(`Ran ${testCount} tests, all tests passed!`);
        } else {
            console.log(`Ran ${testCount} tests, ${failed.length} failed.`);
        }

        for (const failCase of failed) {
            console.log(`Failing test: `);
            await this.runOneCase(failCase, { log: true });
        }
    }

    async runOneCase(testCase: TestCase, options) {
        const session = new TestSession()
        session.conn = this.conn;
        session.consoleLog = options.log;

        session.log('-- Setup');
        await session.setup();

        session.log('-- Finished setup');
        await testCase(session);
        return session;
    }
}

function parseCommand(str: string) {
    const args = str.split(/ +/);
    const argsStr = str.substr(str.indexOf(' ') + 1);
    return {
        command: args[0],
        argsStr,
        args: args.slice(1)
    }
}

export class TestSession {
    conn: CommandConnection
    lastResult = null
    consoleLog: boolean = false
    failed: boolean = null

    log(msg: string) {
        if (this.consoleLog) {
            console.log('[test] ' + msg);
        }
    }

    fail(msg: string) {
        this.failed = true;
        this.log('FAIL: ' + msg);
    }

    async command(cmd: string): Promise<string> {
        const result = await this.conn.run(cmd);
        this.log(`${cmd} -> ${result}`);
        return result;
    }

    async setup() {
        await this.command('context testcase/#unique');
    }

    async runSteps(steps: string[]) {
        for (let step of steps) {
            step = step.trim()
            if (step === '')
                continue;

            const command = parseCommand(step);

            if (command.command === 'expect') {
                if (this.lastResult !== command.argsStr) {
                    this.fail('expected ' + command.argsStr);
                }

                continue;
            }

            const result = await this.command(step);
            this.lastResult = result;
        }
    }

    async runScript(script: string) {
        const steps = script.split('\n')
        return await this.runSteps(steps);
    }
}
