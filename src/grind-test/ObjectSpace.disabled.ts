
import { test } from '.'

test('can get on an object-space column', async ({run}) => {
    await run('set object-type/ot');
    await run('set object-type/ot attribute/attr1');

    expect(await run('get ot/ot1')).toEqual('#null');
    await run('set ot/ot1')
    expect(await run('get ot/ot1')).toEqual('#exists');
    expect(await run('get ot/ot2')).toEqual('#null');

    expect(await run('get ot/ot1 attr1/*')).toEqual(['attr1']);
    await run('set ot/ot1 attr1/test');
    expect(await run('get ot/ot1 attr1/*')).toEqual(['attr1/test']);
});

test('ObjectSpace attributes exclude multiple values', async ({run}) => {
    await run('set object-type/ot');
    await run('set object-type/ot attribute/attr1');
    await run('set ot/ot3');

    expect(await run('get ot/ot3 attr1/*')).toEqual(["attr1"]);
    await run('set ot/ot3 attr1/1');
    expect(await run('get ot/ot3 attr1/*')).toEqual(["attr1/1"]);
    await run('set ot/ot3 attr1/2');
    expect(await run('get ot/ot3 attr1/*')).toEqual(["attr1/2"]);
});

test('can set (unique) with objects', async ({run, graph}) => {
    await run('set object-type/ot');
    expect(await run('set ot/(unique)')).toEqual(['ot/ot-1']);
});

test('errors with unexpeced expr', async ({run}) => {
    await run('set object-type/ot');
    expect(await run('set ot/(something-else)')).toEqual(
        "#error unexpected expression: (something-else)");
});

test('errors with unrecognized attribute', async ({run}) => {
    await run('set object-type/ot');
    expect(await run('set ot/ot3 notattr/1')).toEqual(
        "#error object type 'ot' has no attribute 'notattr'");
});

test('can get multiple attributes at once', async ({run}) => {
    await run('set object-type/ot');
    await run('set object-type/ot attribute/attr1');
    await run('set object-type/ot attribute/attr2');

    await run('set ot/ot4 attr1/a');
    await run('set ot/ot4 attr2/b');

    expect(await run('get ot/ot4 attr1/* attr2/*')).toEqual(['attr1/a attr2/b']);
});

test('getting a nonexisting object returns nothing', async ({run}) => {
    await run('set object-type/ot');
    expect(await run('get ot/ot5')).toEqual('#null');
});

test('getting attributes from a nonexisting object returns nothing', async ({run}) => {
    await run('set object-type/ot');
    expect(await run('get ot/ot6 attr/a')).toEqual('#null');
});

test('implicitly creates an object during attribute assignment', async ({run}) => {
    await run('set object-type/ot');
    await run('set ot/ot7 foo/a');
    expect(await run('get ot/ot7')).toEqual('#exists');
});

test('supports object search by value', async ({run}) => {
    await run('set object-type/ot');
    await run('set object-type/ot attribute/foo');
    await run('set ot/8 foo/a');
    await run('set ot/9 foo/a');
    await run('set ot/10 foo/b');
    expect(await run('get ot/* foo/a')).toEqual(['ot/8', 'ot/9']);
});
