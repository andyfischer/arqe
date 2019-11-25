
import CommandConnection from './CommandConnection'
import TestSession from './TestSession'
import TestSuite from './TestSuite'

async function simpleSaveAndLoad(session: TestSession) {
    await session.runScript(`
        get a/x
        expect #null
        save a/x
        get a/x
        expect #exists
        get a/y
        expect #null
    `);
}

async function contextIsolation(session: TestSession) {
    await session.runScript(`
        get a/top
        expect #null
        save a/top
        get a/isolated
        expect #null
        context isolation
        get a/isolated
        expect #null
        save a/isolated
        get a/isolated
        expect #exists
        context -isolation
        get a/top
        expect #exists
        get a/isolated
        expect #null
    `);
}

export async function mainFunctionalTests(conn: CommandConnection) {

    const suite = new TestSuite();
    suite.conn = conn;
    await suite.runAll([
        simpleSaveAndLoad,
        contextIsolation
    ])
    const session = new TestSession();
    session.conn = conn;
}
