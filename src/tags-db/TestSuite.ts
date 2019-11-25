
import CommandConnection from './CommandConnection'
import TestSession from './TestSession'

export type TestCase = (session: TestSession) => Promise<void>

export default class TestSuite {
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

        console.log(`Ran ${testCount} tests, ${failed.length} failed.`);

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
