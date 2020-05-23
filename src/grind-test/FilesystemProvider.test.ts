
import Path from 'path'
import { test } from '.'

test("can read file from fs provider", async ({run}) => {

    const path = Path.join(__dirname, '../../tests/sample-files/file1');

    const result = (await run(`get fs filename(${path}) file-contents/*`))[0]
        .replace(/\n/, '');

    expect(result).toEqual('file-contents(file 1 contents)');
});

test("can read directory from fs provider", async ({run}) => {

    /*
    const path = Path.join(__dirname, '../../tests/sample-files/file1');

    const result = (await run(`get fs filename(${path}) file-contents/*`))
        .replace(/\n/, '');

    expect(result).toEqual('file-contents(file 1 contents)');
    */
});
