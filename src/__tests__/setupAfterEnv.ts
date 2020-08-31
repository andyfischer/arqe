
function setupTracer() {
    const existing = (global as any).traceService;
    if (existing)
        return;

    const initTracer = require('jaeger-client').initTracer;

    // See schema https://github.com/jaegertracing/jaeger-client-node/blob/master/src/configuration.js#L37
    const config = {
        serviceName: 'arqe-tests',
        sampler: {
            type: 'const',
            param: 1,
          },
          reporter: {
            logSpans: true,
          },
    };
    const options = {
        tags: {
        },
        /*
        logger: {
            info: function logInfo(msg: string) {
              console.log('INFO  ', msg);
            },
            error: function logError(msg: string) {
              console.log('ERROR ', msg);
            },
          },
          */
    };

    const tracer = initTracer(config, options);

    (global as any).traceService = tracer;
}

beforeAll(() => {
    setupTracer();
})

afterAll(() => {
    (global as any).traceService.close()
})