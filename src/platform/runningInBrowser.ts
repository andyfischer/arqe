
export default function runningInBrowser() {
    return (typeof process === 'undefined') || process.title === 'browser';
}
