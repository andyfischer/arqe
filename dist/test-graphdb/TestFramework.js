"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class TestSuite {
    async runAll(cases) {
        let testCount = 0;
        const failed = [];
        for (const testCase of cases) {
            testCount += 1;
            const session = await this.runOneCase(testCase, {});
            if (session.failed)
                failed.push(testCase);
        }
        if (failed.length === 0) {
            console.log(`Ran ${testCount} tests, all tests passed!`);
        }
        else {
            console.log(`Ran ${testCount} tests, ${failed.length} failed.`);
        }
        for (const failCase of failed) {
            console.log(`Failing test: `);
            await this.runOneCase(failCase, { log: true });
        }
    }
    async runOneCase(testCase, options) {
        const session = new TestSession();
        session.conn = this.conn;
        session.consoleLog = options.log;
        session.log('-- Setup');
        await session.setup();
        session.log('-- Finished setup');
        await testCase(session);
        return session;
    }
}
exports.TestSuite = TestSuite;
function parseCommand(str) {
    const args = str.split(/ +/);
    const argsStr = str.substr(str.indexOf(' ') + 1);
    return {
        command: args[0],
        argsStr,
        args: args.slice(1)
    };
}
class TestSession {
    constructor() {
        this.lastResult = null;
        this.consoleLog = false;
        this.failed = null;
    }
    log(msg) {
        if (this.consoleLog) {
            console.log('[test] ' + msg);
        }
    }
    fail(msg) {
        this.failed = true;
        this.log('FAIL: ' + msg);
    }
    async command(cmd) {
        let responsePromise = this.conn.runGetFullResponse(cmd);
        if (await utils_1.timedOut(responsePromise, 5000)) {
            throw new Error('Timed out waiting for response: ' + cmd);
        }
        let result = await responsePromise;
        if (Array.isArray(result))
            result = JSON.stringify(result);
        this.log(`${cmd} -> ${result}`);
        return result;
    }
    async setup() {
        await this.command('context testcase/#unique');
    }
    async runSteps(steps) {
        for (let step of steps) {
            step = step.trim();
            if (step === '')
                continue;
            if (step.startsWith('-- ')) {
                this.log(step);
                continue;
            }
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
    async runScript(script) {
        const steps = script.split('\n');
        return await this.runSteps(steps);
    }
}
exports.TestSession = TestSession;
//# sourceMappingURL=TestFramework.js.map