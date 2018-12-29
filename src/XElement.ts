
import { render, TemplateResult } from "lit-html";

let idCounter: number = 0;
const owners = new Map<String, Object>();

abstract class XElement extends HTMLElement {
    private readonly _id: number;
    private _version: number;

    private _isMounted: boolean = false;
    private _isRendering: boolean = false;

    protected _shadowRoot: ShadowRoot;

    private owner: any;
    private storage: any;
    protected data: any;
    private oversion: string;
    private oid: string;

    get identifier(): number { return this._id; }
    get version(): number { return this._version; }

    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(document.createElement("div"));

        this._id = idCounter++;
        this._version = 0;

        owners[this.identifier] = this;
    }

    updateVersion(): void {
        this._version++;
    }

    differs<T>(a: T, b: T): boolean {
        return a !== b;
    }

    nameof(selector: () => any, fullname: boolean = false): string {
        var s = '' + selector;
        var m = s.match(/return\s+([A-Z$_.]+)/i) || s.match(/.*?(?:=>|function.*?{(?!\s*return))\s*([A-Z$_.]+)/i);
        var name = m && m[1] || "";
        return fullname ? name : name.split('.').reverse()[0];
    }

    attributeChangedCallback(name, oldValue, newValue) {

        if (name === "owner") { //step 1
            this.owner = owners[newValue];
        }
        else if (name === "storage") { //step 2
            this.storage = this.owner[newValue];
        }
        else if (name === "oindex") { //step 3
            this.data = this.storage[newValue];
        }
        else if (name === "oid") { //invalidator
            this.oid = newValue;
        }
        else if (name === "oversion") { //invalidator
            this.oversion = newValue;
        }
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

                render(this.render(), this.shadowRoot); //, { templateFactory: tf });
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

    static get observedAttributes() {
        return ["owner", "storage", "oindex", "oid", "oversion"];
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

export { XElement as default, registerElement, uses };
