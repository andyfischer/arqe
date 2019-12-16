
export default function logError(err) {
    console.error(err.stack || err);
}
