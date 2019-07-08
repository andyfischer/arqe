
import { test } from '.'

test('unrecognized command error', async ({run}) => {
    expect(await run('blah', { allowError: true } )).toEqual('#error unrecognized command: blah');
});

test('unrecognized command error with pipe', async ({run}) => {
    expect(await run('blah | get', { allowError: true } )).toEqual('#error unrecognized command: blah');
});
