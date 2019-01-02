import XElement, { registerElement, Is, supportXType } from "./XElement";
import { AttributePart, TemplateResult, directive } from "lit-html";

export default function XInline<TExtend>(name: string, properties: string[], renderer: (self: XElement & TExtend) => TemplateResult) {

    function defineProperties(setup: XInline, properties: string[]) {
        for (var i = 0; i < properties.length; i++) {

            let property = properties[i];
            let storage = setup[property];

            Object.defineProperty(setup, property, {
                get() { return storage; },
                set(value) {
                    if (storage !== value) {
                        storage = value; //assign to local, no infinitive loop thanks
                        setup.invalidate();
                    }
                },
            });
        }
    }

    @registerElement
    class XInline extends XElement {

        static readonly is: string = name;

        constructor() {
            super();

            defineProperties(this, properties);
        }

        render() {
            return renderer(this as unknown as XElement & TExtend);
        }
    }

    const signature = XInline as unknown as XElement & TExtend & { new(): XElement, is: string; };
    const component = supportXType(signature) as unknown as { commiter: () => void } & typeof signature;

    return component;
}
