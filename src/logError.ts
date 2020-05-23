
export default function logError(event) {
    const error = event.stack || event;

    console.error(error);
}
