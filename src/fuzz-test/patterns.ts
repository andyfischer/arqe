
import Graph from '../Graph'
import { parsePattern } from '../parseCommand'
import parseObjectToPattern, { parsePatternToObject } from '../parseObjectToPattern'
import Tuple from '../Tuple'

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
        console.log(`Fuzz test "${this.name}" failed: ${message}`);
    }
}

function checkIsSupersetOf(session: FuzzTestSession, example: Tuple) {
    const pattern = parsePattern(example.getValueForType("pattern"));
    const isSupersetOf = parsePattern(example.getValueForType("is-superset-of"));

    if (pattern.isSupersetOf(isSupersetOf)) {
        session.markPass();
    } else {
        session.markFail(`checking is-superset-of: ${example.stringify()}`);
    }
}

function checkNotSupersetOf(session: FuzzTestSession, example: Tuple) {
    const pattern = parsePattern(example.getValueForType("pattern"));
    const notSupersetOf = parsePattern(example.getValueForType("not-superset-of"));

    if (!pattern.isSupersetOf(notSupersetOf)) {
        session.markPass();
    } else {
        session.markFail(`checking not-superset-of: ${example.stringify()}`);
    }
}

function checkEqualsFromJson(session: FuzzTestSession, example: Tuple) {
    const pattern = parsePattern(example.getValueForType("pattern"));
    const jsonStr = example.getValueForType("equals-from-json");
    const json = JSON.parse(jsonStr);
    const patternFromObject = parseObjectToPattern(json);

    if (pattern.equals(patternFromObject)) {
        session.markPass();
    } else {
        session.markFail(`checkEqualsFromJson: ${example.stringify()}. `+
                    `Expected: (${pattern.stringify()}) to equal (${patternFromObject.stringify()})`);
    }

    const patternToObject = parsePatternToObject(pattern);
    const patternToObjectStr = JSON.stringify(patternToObject)

    if (patternToObjectStr === jsonStr) {
        session.markPass();
    } else {
        session.markFail(`checkEqualsFromJson (parsePatternToObject): ${example.stringify()}. `+
                    `Expected: (${patternToObjectStr}) to equal (${jsonStr})`);
    }
}

function checkPatternToObjectConversion(session: FuzzTestSession, example: Tuple) {
    const pattern = parsePattern(example.getValueForType("pattern"));
    const asObject = parsePatternToObject(pattern);
    const backToPattern = parseObjectToPattern(asObject);

    if (pattern.equals(backToPattern)) {
        session.markPass();
    } else {
        session.markFail(`checkPatternToObjectConversion on: ${example.stringify()}. `+
                         `Expected (${pattern.stringify()}) to equal (${backToPattern.stringify()})`);
    }
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

export default function fuzzTestPatterns(graph: Graph) {

    const session = new FuzzTestSession(graph, 'Patterns');

    runCheck(session, "get pattern-test-example pattern/* is-superset-of/*", checkIsSupersetOf);
    runCheck(session, "get pattern-test-example pattern/* not-superset-of/*", checkNotSupersetOf);
    runCheck(session, "get pattern-test-example pattern/* equals-from-json/*", checkEqualsFromJson);
    runCheck(session, "get pattern-test-example pattern/*", checkPatternToObjectConversion);

    return session;
}
