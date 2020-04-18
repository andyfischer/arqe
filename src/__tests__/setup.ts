
jest.mock('../internalError.ts', () => (s) => {
    const message = '[internal error] ' + s
    fail(message);
});

