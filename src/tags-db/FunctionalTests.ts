
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

export async function mainFunctionalTests(conn: CommandConnection) {

    const suite = new TestSuite();
    suite.conn = conn;


    await suite.runAll(loadCasesFromFiles());
    
    const session = new TestSession();
    session.conn = conn;
}
