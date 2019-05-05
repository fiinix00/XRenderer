
export type StyleType = { [x: string]: StyleType; } | string | number;

let cache: { [x: string]: string; } = {};

let originalPrefix = 'x';
let prefix = originalPrefix;

export type AdoptedStyleSheetsType = { adoptedStyleSheets: CSSStyleSheet[] }; 

export const cxsSheet = new CSSStyleSheet();
(document as any as AdoptedStyleSheetsType).adoptedStyleSheets = [cxsSheet];

function insert(rule) {
    cxsSheet.insertRule(rule);
}

const hyph = (s: string) => s.replace(/[A-Z]|^ms/g, '-$&').toLowerCase();
const mx = (rule: string, media: string = undefined) => media ? `${media}{${rule}}` : rule;
const rx = (cn, prop, val) => `.${cn}{${hyph(prop)}:${val}}`;
const noAnd = (s: string) => s.replace(/&/g, '');

function parse(obj: StyleType, child = '', media: string = undefined): string {
    return Object.keys(obj)
        .map(key => {
            const val = obj[key];

            if (val === null) {
                return '';
            }
            else if (typeof val === 'object') {
                const m2 = /^@/.test(key) ? key : null;
                const c2 = m2 ? child : child + key;

                return parse(val, c2, m2 || media);
            }
            else {
                const _key = key + val + child + media;
                if (cache[_key]) return cache[_key];

                const className = prefix + (cxsSheet.cssRules.length).toString(36);
                insert(mx(rx(className + noAnd(child), key, val), media));
                cache[_key] = className;

                return className;
            }
        })
        .join(' ');
}

export default function cxs(...styles: StyleType[]) {
    return styles
        .map(style => parse(style))
        .join(' ')
        .trim();
}

//cxs.css = () => rules.sort().join('');

//cxs.reset = () => {
//    cache = {};
//    rules.length = 0; //while (rules.length) rules.pop();
//}

cxs.getPrefix = () => prefix;

cxs.setPrefix = (val: string) => {
    prefix = val;
}

const popList: string[] = [];

cxs.pushPrefix = (val: string) => {

    if (popList.length == 0) {
        originalPrefix = prefix;
    }

    popList.push(val);
    cxs.setPrefix(val);
}

cxs.popPrefix = () => {
    if (popList.length > 0) {
        const prefix = popList.pop();
        cxs.setPrefix(prefix);
    } else {
        cxs.setPrefix(originalPrefix);
    }
}
