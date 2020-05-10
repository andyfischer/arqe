"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function runMatcher(items, matcher) {
    let state = matcher.getInitialState();
    while (matcher.getStatus(state) === 'in-progress')
        state = matcher.advance(state);
    return matcher.getResult(state);
}
exports.runMatcher = runMatcher;
function allTrue(items) {
    for (const i of items)
        if (!i)
            return false;
    return true;
}
function anyTrue(items) {
    for (const i of items)
        if (i)
            return true;
    return false;
}
function zip(leftList, rightList, func) {
    return leftList.map((left, i) => {
        const right = rightList[i];
        return func(left, right);
    });
}
function multimatcher(matchers) {
    return {
        getInitialState() {
            return matchers.map(m => m.getInitialState());
        },
        advance(state) {
            return zip(matchers, state, (m, s) => {
                if (m.isFinished(s))
                    return s;
                return m.advance(s);
            });
        },
        getStatus(state) {
            const statuses = zip(matchers, state, (m, s) => m.getStatus(s));
            for (const status of statuses) {
                if (status === 'done-match')
                    return 'done-match';
            }
            for (const status of statuses) {
                if (status === 'in-progress')
                    return 'in-progress';
            }
            return 'done-fail';
        },
        getResult(state) {
            const results = zip(matchers, state, (m, s) => {
                if (m.isFinished(s) && m.isSuccess(s))
                    return { result: m.getResult(s) };
                else
                    return null;
            })
                .filter(r => !!r)
                .map(r => r.result);
            if (results.length > 1)
                throw new Error('ambiguous match');
            return results[0];
        }
    };
}
exports.multimatcher = multimatcher;
//# sourceMappingURL=util.js.map