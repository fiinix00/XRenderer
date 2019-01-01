
import { render, TemplateResult, directive, AttributePart } from "lit-html";

let idCounter: number = 0;
const owners = new Map<String, Object>();

interface IVersionId {
    readonly version: number;
    readonly identifier: number;
}

const assign = directive((v: any) => (part: AttributePart) => {
    const committer = part.committer;
    const element = committer.element;
    const name = committer.name;

    const current = element[name];

    if (current != v) {
        element[name] = v;
    }

    //if (part.value !== v) {
    //    part.setValue(v)
    //}
});

abstract class XElement extends HTMLElement implements IVersionId {
    private readonly _id: number;
    private _version: number;

    private _isMounted: boolean = false;
    private _isRendering: boolean = false;

    protected _shadowRoot: ShadowRoot;
    
    get identifier(): number { return this._id; }
    get version(): number { return this._version; }

    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });

        this._id = idCounter++;
        this._version = 0;

        owners[this.identifier] = this;
    }

    updateVersion(invalidate = true): void {
        this._version++;

        if (invalidate) {
            this.invalidate();
        }
    }

    differs<T>(a: T, b: T): boolean {
        return a !== b;
    }

    static nameofRegExp1: RegExp = /return\s+([A-Z$_.]+)/i;
    static nameofRegExp2: RegExp = /.*?(?:=>|function.*?{(?!\s*return))\s*([A-Z$_.]+)/i;

    nameof(selector: () => any, fullname: boolean = false): string {
        var s = selector.toString();
        var m = s.match(XElement.nameofRegExp1) || s.match(XElement.nameofRegExp2);
        var name = m && m[1] || "";
        return fullname ? name : name.split('.').reverse()[0];
    }
    
    abstract render(): TemplateResult;

    invalidate() {
        if (!this._isRendering) {
            this._isRendering = true;
            {
                //function tf(result: TemplateResult): Template {
                //    debugger;
                //    return templateFactory(result);
                //}

                const rendered = this.render();

                if (rendered !== null) {
                    render(rendered, this.shadowRoot); //, { templateFactory: tf });
                }
            }
            this._isRendering = false;
        }
    }

    connectedCallback() {
        owners[this.identifier] = this;
        this._isMounted = true;

        this.invalidate();
    }

    disconnectedCallback() {
        this._isMounted = false;
        delete owners[this.identifier];
    }
}

interface Is {
    is: string;
}

function registerElement(constructor: Function) {
    const ctor: Is = <Is><Object>constructor;

    if (!("is" in ctor)) {
        throw new Error(`Missing 'static is: string' property on type \n${constructor}`);
    }
    
    customElements.define(ctor.is, constructor);
}

function uses(...types: Function[]) { // this is the decorator factory
    return function (target) { // this is the decorator
        Object.assign(target, { __usesTypes: types });
    }
}

export { XElement as default, registerElement, uses, IVersionId, assign };
