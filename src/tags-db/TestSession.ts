
import CommandConnection from './CommandConnection'
import { parseAsSave } from './parseCommand'

function parseCommand(str: string) {
    const args = str.split(/ +/);
    return {
        command: args[0],
        args: args.slice(1)
    }
}

export default class TestSession {
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
        const responseArgs = parseAsSave(await this.command('save-unique testcase/*'));
        const testId = responseArgs[0].tagValue;
        await this.command('context testcase/' + testId);
    }

    async runSteps(steps: string[]) {
        for (let step of steps) {
            step = step.trim()
            if (step === '')
                continue;

            const command = parseCommand(step);

            if (command.command === 'expect') {
                if (this.lastResult !== command.args[0]) {
                    this.fail('expected ' + command.args[0]);
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
