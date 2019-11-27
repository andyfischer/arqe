
import CommandConnection from './CommandConnection'
import { TestSession, TestSuite } from '../test-framework'

function fromScript(script: string) {
    return (async (session: TestSession) => {
        return await session.runScript(script);
    })
}

const saveAndLoadTests = [
fromScript(`
    get a/x
    expect #null
`),
fromScript(`
    save a/x
    get a/x
    expect #exists
`),
fromScript(`
    save a/x b/y
    get b/y a/x
    expect #exists
`),
]

const contextTests = [
fromScript(`
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
`),
fromScript(`
    context -nonexistanttag
`),
fromScript(`
    save lower/a a/1
    context lower/a
    get a/1
    expect #exists
    context -lower/a
`)]

const getMultiTests = [
fromScript(`
    get a/*
    expect []
`),
fromScript(`
    save a/1
    get a/*
    expect [1]
`),
fromScript(`
    save a/1
    save a/2
    get a/*
    expect [1, 2]
    save a/3
    get a/*
    expect [1, 2, 3]
`)]

const getMultiWithFixed = [
fromScript(`
    save a/1 b/1
    save a/2 b/1
    save a/3 b/2
    get a/* b/1
    expect [1, 2]
`),
fromScript(`
    save a/1 b/1
    save a/2 b/1
    save a/3 b/2
    get a/* b/2
    expect [3]
`),
fromScript(`
    save a/1 b
    save a/2 b
    save a/3 c
    get a/* b
    expect [1, 2]
    get a/* c
    expect [3]
`)]

export async function mainFunctionalTests(conn: CommandConnection) {

    const suite = new TestSuite();
    suite.conn = conn;
    await suite.runAll([
        ...saveAndLoadTests,
        ...contextTests,
        ...getMultiTests,
        ...getMultiWithFixed
    ])
    const session = new TestSession();
    session.conn = conn;
}
