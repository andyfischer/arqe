
import Graph from '../Graph'
import parseObjectToPattern, { patternToJson } from '../parseObjectToPattern'
import Tuple from '../Tuple'
import Stream from '../Stream'
import { receiveToTupleList } from '../receiveUtils'
import { loadLocalBootstrapConfigs } from '../loadBootstrapConfigs'
import parseTuple from '../parseTuple'

class FuzzTestSession {
    graph: Graph
    passed: number = 0
    failed: number = 0

    name: string

    constructor(graph: Graph, name: string) {
        this.graph = graph;
        this.name = name;
    }

    markPass() {
        this.passed += 1;
    }

    markFail(message: string) {
        this.failed += 1;
        console.log(`Test failure (${this.name} test): ${message}`);
    }
}

function checkIsSupersetOf(session: FuzzTestSession, example: Tuple) {
    const pattern = parseTuple(example.getVal("pattern"));
    const isSupersetOf = parseTuple(example.getVal("is-superset-of"));

    if (pattern.isSupersetOf(isSupersetOf)) {
        session.markPass();
    } else {
        session.markFail(`checking is-superset-of: ${example.stringify()}`);
    }
}

function checkNotSupersetOf(session: FuzzTestSession, example: Tuple) {
    const pattern = parseTuple(example.getVal("pattern"));
    const notSupersetOf = parseTuple(example.getValOptional("not-superset-of", ''));

    if (!pattern.isSupersetOf(notSupersetOf)) {
        session.markPass();
    } else {
        session.markFail(`checking not-superset-of: ${example.stringify()}`);
    }
}

function checkEqualsFromJson(session: FuzzTestSession, example: Tuple) {
    const pattern = parseTuple(example.getVal("pattern"));
    const jsonStr = example.getVal("equals-from-json");
    const json = JSON.parse(jsonStr);
    const patternFromObject = parseObjectToPattern(json);

    if (pattern.equals(patternFromObject)) {
        session.markPass();
    } else {
        session.markFail(`checkEqualsFromJson: ${example.stringify()}. `+
                    `Expected: (${pattern.stringify()}) to equal (${patternFromObject.stringify()})`);
    }

    const patternToObject = patternToJson(pattern);
    const patternToObjectStr = JSON.stringify(patternToObject)

    if (patternToObjectStr === jsonStr) {
        session.markPass();
    } else {
        session.markFail(`checkEqualsFromJson (patternToJson): ${example.stringify()}. `+
                    `Expected: (${patternToObjectStr}) to equal (${jsonStr})`);
    }
}

function checkPatternToObjectConversion(session: FuzzTestSession, example: Tuple) {
    const pattern = parseTuple(example.getVal("pattern"));
    const asObject = patternToJson(pattern);
    const backToPattern = parseObjectToPattern(asObject);

    if (pattern.equals(backToPattern)) {
        session.markPass();
    } else {
        session.markFail(`checkPatternToObjectConversion on: ${example.stringify()}. `+
                         `Expected (${pattern.stringify()}) to equal (${backToPattern.stringify()})`);
    }
}

function pass(joinWith: Tuple, out: Stream) {
    out.next(joinWith.addNewTag('passed'));
}

function fail(joinWith: Tuple, out: Stream, message: string) {
    out.next(joinWith.addNewTag('failed').addNewTag('message', message));
}

function expectEquals(example: Tuple, expected: any, observed: any, out: Stream) {
    if (expected === observed)
        pass(example, out);
    else
        fail(example, out, `expected (${expected}) != observed (${observed})`);
}

function checkPatternRestringify(example: Tuple, out: Stream) {
    const patternStr = example.getVal("pattern");
    const pattern = parseTuple(patternStr);

    // ignore if this pattern has an expression
    for (const tag of pattern.tags)
        if (tag.exprValue)
            return;

    const observed = pattern.stringify();
    expectEquals(example, patternStr, observed, out);
}

function runCheck(session: FuzzTestSession, queryStr: string, verifier: (session: FuzzTestSession, example: Tuple) => void) {
    const graph = session.graph;

    for (const example of graph.runSync(queryStr)) {
        if (example.isCommandMeta()) {
            if (example.isCommandError()) {
                session.markFail(`Query returned error on ${queryStr}: ${example.stringify()}`);
                return;
            }

            continue;
        }

        try {
            verifier(session, example);
        } catch (e) {
            session.markFail(`Uncaught exception looking at (${example.stringify()}): ${e.stack || e}`);
        }
    }
}

function runCheck2(session: FuzzTestSession, queryStr, verifier: (example: Tuple, out: Stream) => void) {
    const graph = session.graph;
    const testName = verifier.name;

    const receiver = receiveToTupleList(list => {
        for (const result of list) {
            if (result.hasAttr('passed')) {
                session.markPass();
            } else if (result.hasAttr('failed')) {
                session.markFail(`(${testName}) ${result.getVal('message')}`);
            } else {
                console.log('runCheck2 saw incomplete result: ' + result.stringify());
            }
        }
    });

    for (const example of graph.runSync(queryStr)) {
        if (example.isCommandMeta()) {
            if (example.isCommandError()) {
                session.markFail(`Query returned error on ${queryStr}: ${example.stringify()}`);
                return;
            }

            continue;
        }

        try {
            verifier(example, receiver);
            receiver.done();
        } catch (e) {
            session.markFail(`Uncaught exception looking at (${example.stringify()}): ${e.stack || e}`);
        }
    }
}

export default function fuzzTestPatterns(graph: Graph) {

    const session = new FuzzTestSession(graph, 'Patterns');

    runCheck(session, "get pattern-test-example pattern/* is-superset-of/*", checkIsSupersetOf);
    runCheck(session, "get pattern-test-example pattern/* not-superset-of/*", checkNotSupersetOf);
    runCheck(session, "get pattern-test-example pattern/* equals-from-json/*", checkEqualsFromJson);
    runCheck(session, "get pattern-test-example pattern/*", checkPatternToObjectConversion);
    runCheck2(session, "get pattern-test-example pattern/* ", checkPatternRestringify);

    return session;
}

if (require.main === module) {
    require('source-map-support').install();
    const graph = new Graph();
    loadLocalBootstrapConfigs(graph);
    const session = fuzzTestPatterns(graph);

    console.log("Finished: ", { passed: session.passed, failed: session.failed });
}
