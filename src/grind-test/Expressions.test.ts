
import { test } from '.'

beforeAll(() => {
    const nowTime = Date.now();
    Date.now = () => nowTime;
});

test('seconds-from-now expression', async({run}) => {
    expect(await run('set a/(seconds-from-now 5)')).toEqual([`a/${Date.now() + 5000}`]);
});
