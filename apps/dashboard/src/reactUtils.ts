import React from "react";

interface Options {
    el?: string
    classes?: string
    vars?: string
}

export function styleComponent(className: string, opts: Options = {}) {
    const el = opts.el || 'div'
    const classesMap = {};
    const varsMap = {};

    for (const cssClass of (opts.classes || '').split(' ')) {
        classesMap[cssClass] = true;
    }

    for (const v of (opts.vars || '').split(' ')) {
        varsMap[v] = true;
    }

    return (props) => {

        let fullClassName = className;
        let passdownProps = {}

        for (const propName in props) {
            const propVal = props[propName];
            if (classesMap[propName]) {

                if (propVal)
                    fullClassName += ' ' + propName;

            } else if (varsMap[propName]) {

                if (!passdownProps.style)
                    passdownProps.style = {}
                passdownProps.style[`--${propName}`] = propVal;
            } else {
                passdownProps[propName] = propVal;
            }
        }

        return React.createElement(el, {
            ...passdownProps,
            className: fullClassName,
        })
    }
}
