
export default function debounce(ms, callback) {
    return (...args) => {
        let timer;

        if (!timer) {
            timer = setTimeout(() => {
                timer = null;
                callback.apply(null, args);
            }, ms);
        }
    }
}
