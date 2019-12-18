/*
 CommandConnection
  - WebSocket
  - ServerSocket
  - GraphContext
  - Graph
*/

import Fs from 'fs'
import Path from 'path'
import CommandConnection from '../socket/CommandConnection'
import { TestSession, TestSuite } from './TestFramework'

function fromScript(script: string) {
    return (async (session: TestSession) => {
        return await session.runScript(script);
    })
}

function loadCasesFromFiles() {
    const testDir = __dirname + '/../../src/test-graphdb'
    const files = Fs.readdirSync(testDir)
    return files
        .filter(file => file.endsWith('.txt'))
        .map(file => {
            const filename = Path.join(testDir, file);
            const contents = Fs.readFileSync(filename, 'utf8');
            return fromScript(`-- File: ${file}\n${contents}`)
        });
}

async function testSaveUnique(session: TestSession) {
    const result = await session.command('set uniquetype/#unique');
    if (!result.startsWith('set uniquetype/'))
        session.fail('expected "set uniquetype/...", saw: ' + result);

    if (result.indexOf('#unique') !== -1)
        session.fail('expected not to contain "#unique": ' + result);
}

async function testGetConnectionId(session: TestSession) {
    const result = await session.command('get -x connection/?');

    if (!result.startsWith('set connection/'))
        session.fail('expected set connection/..., saw: ' + result);

    if (result.indexOf('?') !== -1)
        session.fail('expected not to contain ?: ' + result);
}

const localTests = [
    testSaveUnique,
    testGetConnectionId
]

export default async function mainFunctionalTests(conn: CommandConnection) {

    const suite = new TestSuite();
    suite.conn = conn;

    const testCases = loadCasesFromFiles()
        .concat(localTests);

    await suite.runAll(testCases);
    
    const session = new TestSession();
    session.conn = conn;
}
