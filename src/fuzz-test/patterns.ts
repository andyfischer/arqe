
import Graph from '../Graph'
import { parsePattern } from '../parseCommand'
import parseObjectToPattern from '../parseObjectToPattern'

export default function fuzzTestPatterns(graph: Graph) {

    let passed = 0;
    let failed = 0;

    // Check 'is-superset-of' relations
    for (const rel of graph.runSync("get pattern-test-example pattern/* is-superset-of/*")) {

        if (rel.hasType('command-meta'))
            continue;

        const pattern = parsePattern(rel.getValueForType("pattern"));
        const isSupersetOf = parsePattern(rel.getValueForType("is-superset-of"));

        if (pattern.isSupersetOf(isSupersetOf)) {
            passed += 1;
        } else {
            console.log(`fuzz test failure, checking is-superset-of: ${rel.stringify()}`);
            failed += 1;
        }
    }

    // Check 'not-superset-of' relations
    for (const rel of graph.runSync("get pattern-test-example pattern/* not-superset-of/*")) {

        if (rel.hasType('command-meta'))
            continue;

        const pattern = parsePattern(rel.getValueForType("pattern"));
        const notSupersetOf = parsePattern(rel.getValueForType("not-superset-of"));

        if (!pattern.isSupersetOf(notSupersetOf)) {
            passed += 1;
        } else {
            console.log(`fuzz test failure, checking not-superset-of: ${rel.stringify()}`);
            failed += 1;
        }
    }

    // Check 'equals-from-json' relations
    for (const rel of graph.runSync("get pattern-test-example pattern/* equals-from-json/*")) {
        if (rel.hasType('command-meta'))
            continue;

        const pattern = parsePattern(rel.getValueForType("pattern"));
        const json = JSON.parse(rel.getValueForType("equals-from-json"));
        const patternFromObject = parseObjectToPattern(json);

        if (pattern.equals(patternFromObject)) {
            passed += 1;
        } else {
            failed += 1;
            console.log(`fuzz test failure, checking: ${rel.stringify()}. `+
                        `Expected: (${pattern.stringify()}) equals (${patternFromObject.stringify()})`);
        }
    }

    return { passed, failed };
}
