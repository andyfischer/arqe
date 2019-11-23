
import CommandConnection from './CommandConnection'

async function setup(conn: CommandConnection) {
    const testId = await conn.run('save-unique testcase/*');
    await conn.run('context ' + testId);
}

async function runSteps(conn, steps) {
    for (const step of steps) {
        const result = await conn.run(step);
        console.log(`[test] ${step} -> ${result}`)
    }
}

async function simpleSaveAndLoad(conn: CommandConnection) {
    const steps = [
        'get a/x',
        'save a/x',
        'get a/x',
        'get a/y'
    ];
    
    await runSteps(conn, steps);
}

async function contextIsolation(conn: CommandConnection) {
    console.log('[test] (starting contextIsolation)')
    await runSteps(conn, [
        'get a/top',
        'save a/top',
        'get a/isolated',
        'context isolation',
        'get a/isolated',
        'save a/isolated',
        'get a/isolated',
        'context -isolation',
        'get a/top',
        'get a/isolated',
    ]);
}

export async function mainFunctionalTests(conn: CommandConnection) {

    await setup(conn);

    await simpleSaveAndLoad(conn);
    await contextIsolation(conn);
}
