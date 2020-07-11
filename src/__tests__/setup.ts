
jest.mock('../utils/logError.ts', () => ({
    internalError(s) {
        const message = '[internal error] ' + s
        fail(message);
    }
}));

