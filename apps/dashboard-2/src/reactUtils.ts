import React from "react";

interface Options {
    mayHave?: string
}

export function withClassname(el: string, className: string, opts: Options = {}) {
    const mayHaveList = (opts.mayHave || '').split(' ');

    return (props) => {
        let localClassName = className;
        let localProps = {}
        for (const mayHave of mayHaveList) {
            if (props[mayHave])
                localClassName += ' ' + mayHave;
            localProps[mayHave] = null;
        }
        return React.createElement(el, {
            ...props,
            className: localClassName,
            ...localProps
        })
    }
}