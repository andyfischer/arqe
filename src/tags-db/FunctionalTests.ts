
import CommandConnection from './CommandConnection'

export async function mainFunctionalTests(conn: CommandConnection) {
    const steps = [
        'save-unique testcase/*',
        'get a/x',
        'get a/y'
    ];

    for (const step of steps) {
        console.log('[test] ' + step)
        const result = await conn.run(step);
        console.log('[test result] ' + result)
    }
}
