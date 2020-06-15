
jest.mock('../logError.ts', () => ({
    internalError(s) {
        const message = '[internal error] ' + s
        fail(message);
    }
}));

