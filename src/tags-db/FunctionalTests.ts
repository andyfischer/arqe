/*
 CommandConnection
  - WebSocket
  - ServerSocket
  - GraphContext
  - Graph
*/

import Fs from 'fs'
import Path from 'path'
import CommandConnection from './CommandConnection'
import { TestSession, TestSuite } from '../test-framework'

function fromScript(script: string) {
    return (async (session: TestSession) => {
        return await session.runScript(script);
    })
}

function loadCasesFromFiles() {
    const testDir = __dirname + '/../../testScripts/tags-db';
    const files = Fs.readdirSync(testDir)
    return files.map(file => {
        const filename = Path.join(testDir, file);
        const contents = Fs.readFileSync(filename, 'utf8');
        return fromScript(`-- File: ${file}\n${contents}`)
    });
}

async function testSaveUnique(session: TestSession) {
    const result = await session.command('save uniquetype/#unique');
    if (!result.startsWith('save uniquetype/'))
        session.fail('expected "save uniquetype/...", saw: ' + result);

    if (result.indexOf('#unique') !== -1)
        session.fail('expected not to contain "#unique": ' + result);
}

const localTests = [
    testSaveUnique
]

export async function mainFunctionalTests(conn: CommandConnection) {

    const suite = new TestSuite();
    suite.conn = conn;

    const testCases = loadCasesFromFiles()
        .concat(localTests);

    await suite.runAll(testCases);
    
    const session = new TestSession();
    session.conn = conn;
}
