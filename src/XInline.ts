import XElement, { registerElement, Is, supportXType } from "./XElement";
import { AttributePart, TemplateResult, directive } from "lit-html";

export default function XInline<TExtend>(name: string, properties: string[], renderer: (self: XElement & TExtend) => TemplateResult) {

    function defineProperties(setup: XInline, properties: string[]) {
        for (var i = 0; i < properties.length; i++) {

            const property = properties[i];
            
            Object.defineProperty(setup, property, {
                get() { return this.__[property]; },
                set(value) {
                    if (this.__[property] !== value) {
                        this.__[property] = value; //assign to local, no infinitive loop thanks

                        this.invalidate();
                    }
                },

                enumerable: true,
                configurable: false
            });
        }
    }

    @registerElement
    class XInline extends XElement {

        static readonly is: string = name;

        constructor() {
            super();

            // Define property for field values   
            Object.defineProperty(this, '__', {
                value: Object.create(null),

                enumerable: false,
                configurable: false
            });
        }

        render() {
            return renderer(this as unknown as XElement & TExtend);
        }
    }

    defineProperties(XInline.prototype, properties);

    const signature = XInline as unknown as XElement & TExtend & { new(): XElement, is: string; };
    const component = supportXType(signature) as unknown as { commiter: () => void } & typeof signature;

    return component;
}
