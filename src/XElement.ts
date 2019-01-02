
import { render, TemplateResult, directive, AttributePart, html } from "lit-html";

let idCounter: number = 0;
const owners = new Map<String, Object>();

interface IVersionId {
    readonly version: number;
    readonly identifier: number;
}

function extractPossibleOverrideElement(element: Element) {
    const overrideElement = (element as Element & { overrideElement?: Element }).overrideElement;
    return overrideElement || element;
}

const assign = directive((value: any) => (part: AttributePart) => {
    
    const committer = part.committer;
    let element = extractPossibleOverrideElement(committer.element);
    
    const name = committer.name;

    const current = element[name];
    
    if (current !== value) {
        element[name] = value;
    } else {
        if (typeof current === 'object' && "version" in current) {
            if (typeof value === 'object' && "version" in value) {
                var currentV: number = current.version;
                var valueV: number = value.version;
    
                if (currentV !== valueV) {
                    element[name] = value;
                }
            }
        }
    }

    //if (part.value !== v) {
    //    part.setValue(v)
    //}
});

type RefType = <T extends XElement>(handler: (element: T) => void) => T;

const ref = directive((assigner: (element: Node) => void) => (part: AttributePart) => {
    const committer = part.committer;
    const element = extractPossibleOverrideElement(committer.element);

    assigner(element);
}) as unknown as RefType;

function $ /*keep comment*/(self: any, type: Function = null): TemplateResult {

    console.warn("$", self);

    return self;
}

interface Is {
    is: string;
}

const supportXType = directive((value: Is & { new(): Element }) => (part: AttributePart) => {

    const currentChild = part.committer.element;

    if (!("overrideInitialized" in currentChild)) {
        const newChild = new value(); //document.createElement(value.is);
        (newChild as any).overrideInitialized = true;

        currentChild.parentElement.replaceChild(newChild, currentChild);
        part.committer.element = newChild;

        (currentChild as any).overrideElement = newChild;
    }
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
    
    dataChanged(invalidate = true): void {
        this._version++;

        if (invalidate && !this.invalidationPaused) {
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
    
    abstract render(): TemplateResult | Node;

    private invalidationPaused = false;

    public pauseInvalidation() { this.invalidationPaused = true; }
    public resumeInvalidation(invalidate = true) {
        this.invalidationPaused = false;

        if (invalidate) {
            this.invalidate();
        }
    }

    public invalidate() {
        if (!this.invalidationPaused) {
            if (!this._isRendering) {
                this._isRendering = true;
                {
                    //function tf(result: TemplateResult): Template {
                    //    debugger;
                    //    return templateFactory(result);
                    //}

                    const rendered = <any>this.render();

                    if (rendered !== null) {
                        render(rendered, this.shadowRoot); //, { templateFactory: tf });
                    }
                }
                this._isRendering = false;
            }
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

export { XElement as default, registerElement, uses, IVersionId, assign, $, ref, Is, supportXType };
