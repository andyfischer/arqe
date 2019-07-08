
import { test } from '.'

test('get works with different tag order', async ({run}) => {
    await run('set touchpoint/touchpointInputs2 output var/varStr from(var/*)');
    await run('set touchpoint/touchpointInputs2 output var/typeStr from(type/*)');

    expect(await run('get touchpoint/touchpointInputs2 output from/* var/*')).toEqual([
        'from(var/*) var/varStr',
        'from(type/*) var/typeStr'
    ]);
})

