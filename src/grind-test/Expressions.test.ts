
import { test } from '.'

test('seconds-from-now expression', async({run}) => {
    expect('set a/(seconds-from-now 5)').toEqual(`a/${Date.now() + 5000}`);
});
