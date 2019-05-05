
import { render, TemplateResult, directive, AttributePart, html } from "lit-html";
import { AdoptedStyleSheetsType, cxsSheet } from "./cxsmod";

declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
declare type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

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

const assignInner = directive((value: any) => (part: AttributePart) => {
    
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

function assign<TValue>(value: TValue) {

    const a = assignInner(value);

    return assignInner(value) as any as typeof a & TValue;
}

type RefType = <T extends HTMLElement>(handler: (element: T) => void) => T;

const refInner = directive((assigner: (element: Node) => void) => (part: AttributePart) => {
    const committer = part.committer;
    const element = extractPossibleOverrideElement(committer.element);

    assigner(element);
}) as unknown as RefType;

function ref<T extends HTMLElement>() {
    const refMap = new WeakMap();
    const key = {};

    const refInstance = refInner(a => {
        refMap.set(key, a);
    });

    (refInstance as any).get = function () {
        return refMap.get(key);
    }

    return refInstance as any as { get(): T };
}

function $ /*keep comment*/(self: any, type: Function = null): TemplateResult {

    console.warn("$", self);

    return self;
}

interface Is {
    is: string;
}

const supportXType = directive((value: Is & { new(args?): Element }) => (part: AttributePart) => {

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

    public isMounted(): boolean {
        return this._isMounted || false;
    }

    public readonly refs = new WeakMap();

    protected _shadowRoot?: ShadowRoot;
    
    get identifier(): number { return this._id; }
    get version(): number { return this._version; }

    //Handlers for fast access instead of call via "connected" event
    connectedEventHandler: () => void;
    disconnectedEventHandler: () => void;

    useShadowRoot: boolean;

    constructor(htmlImport: typeof html /*make elements have "html" included*/, adoptStyleSheets = true, useShadowRoot = true) {
        super();

        this.useShadowRoot = useShadowRoot;

        if (useShadowRoot) {
            this._shadowRoot = this.attachShadow({ mode: 'open' });

            if (adoptStyleSheets) {
                (this._shadowRoot as any as AdoptedStyleSheetsType).adoptedStyleSheets = [cxsSheet];
            }
        }

        this._id = idCounter++;
        this._version = 0;

        owners[this.identifier] = this;

        const ctor = this.constructor as any;
        if (ctor.activated) {

            const connectedArr = [];
            const disconnectedArr = [];

            const storage = [];

            let index = 0;

            for (let { activator, propertyKey, args } of ctor.activated) {

                const { connected, disconnected } = activator(this, propertyKey, ...args);

                if (connected) {
                    connectedArr.push({ index, connected });
                }

                if (disconnected) {
                    disconnectedArr.push({ index, disconnected });
                }

                index++;
            }

            if (connectedArr.length > 0) {
                this.connectedEventHandler = () => {
                    for (let { index, connected } of connectedArr) {
                        storage[index] = connected.call(this);
                    }
                }

                //this.addEventListener("connected", this.connectedEventHandler);
            }

            if (disconnectedArr.length > 0) {
                this.disconnectedEventHandler = () => {
                    for (let { index, disconnected } of disconnectedArr) {
                        disconnected.call(this, storage[index]);
                    }
                }

                //this.addEventListener("disconnected", this.disconnectedEventHandler);
            }
        }

        this.pauseInvalidation();
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
    
    abstract render(): TemplateResult | Node | string | Date;

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
                        render(rendered, this.useShadowRoot ? this.shadowRoot : this); //, { templateFactory: tf });
                    }
                }
                this._isRendering = false;
            }
        }
    }

    isFirstConnect = true;

    connectedCallback() {
        owners[this.identifier] = this;
        this._isMounted = true;

        this.pauseInvalidation();

        if (this.isFirstConnect) {
            this.isFirstConnect = false;

            for (let i = 0; i < this.attributes.length; i++) {
                const attr = this.attributes[i];

                const name = attr.name;
                const value = attr.value;

                this[name] = value;
            }
        }

        this.connectedEventHandler && this.connectedEventHandler(); //this.dispatchEvent(new CustomEvent('connected', {}));

        this.resumeInvalidation(true /*invalidate*/);
    }

    disconnectedCallback() {
        this._isMounted = false;
        delete owners[this.identifier];

        this.disconnectedEventHandler && this.disconnectedEventHandler(); //this.dispatchEvent(new CustomEvent('disconnected', { }));
    }

    attributePaused = false; //if "this.@property = newValue" changes, dont trigger second change

    attributeChangedCallback(name, oldValue, newValue) {

        if (this.attributePaused) return;

        this[name] = newValue;
    }

    static get observedAttributes(this: any) { //observedAttributes has "special this", the class itself

        //Force initiate "__observedAttributes"
        document.createElement(this.is); 

        //TODO: protowalking
        return this.prototype.__observedAttributes || [];
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

function lifetime(activator: (...args) => { connected: Function, disconnected: Function }, ...args) {

    //Reflect.getMetadata("design:type", target, propertyKey);
    //Interesting reflection types http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-4

    return (target: any, propertyKey: string) => {

        const ctor = target.constructor;

        ctor.activated = [...(ctor.activated || []), { activator, propertyKey, args }];
    };
}

function update(target: XElement, propertyKey: string, type: new () => any, interval: number) {

    return {
        connected: () =>
            setInterval(function self() {
                //immediately activated interval
                target[propertyKey] = new type();
                return self;
            }(), interval),

        disconnected: timer => clearInterval(timer)
    }
}

function property(syncAttribute: boolean = false) {

    //Reflect.getMetadata("design:type", target, propertyKey);
    //Interesting reflection types http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-4

    return (target: XElement, key: string) => {

        const targetMod: XElement & { __observedAttributes: string[] } = target as any;

        targetMod.__observedAttributes = (targetMod.__observedAttributes && [...targetMod.__observedAttributes, key]) || [key];

        let originalValue = target[key];

        delete target[key];

        const backingField = "_" + key;

        Object.defineProperty(target, backingField, {
            writable: true,
            enumerable: false,
            configurable: false,
            value: originalValue
        });

        //https://gist.github.com/remojansen/16c661a7afd68e22ac6e#gistcomment-2825544

        // property getter
        const getter = function (_this: any) {
            return _this[backingField];
        };

        // property setter
        const setter = function (_this: any, newValue: any) {

            const differ = newValue !== getter(_this);
            
            _this[backingField] = newValue;

            if (differ) {
                _this.dataChanged();

                if (syncAttribute) {
                    _this.attributePaused = true; {
                        _this.setAttribute(key, newValue);
                    }
                    _this.attributePaused = false;
                }
            }
        };

        // Create new property with getter and setter
        Object.defineProperty(target, key, {
            get: function () {
                return getter(this);
            },
            set: function (v: any) {
                setter(this, v);
            },
            enumerable: true,
            configurable: true
        });
    };
}

export {
    XElement as default,
    registerElement,
    uses,
    IVersionId,
    assign,
    $,
    ref,
    Is,
    supportXType,
    property,
    lifetime,
    update,

    //lifetime
};
