import XElement, { registerElement, Is, supportXType, getset } from "./XElement";
import { AttributePart, TemplateResult, directive } from "lit-html";

export default function XInline<TExtend>(name: string, properties: string[], renderer: (self: XElement & TExtend) => TemplateResult) {

    function defineProperties(setup: XInline, properties: string[]) {
        for (var i = 0; i < properties.length; i++) {

            const property = properties[i];
            
            getset()(setup, property);
        }
    }

    @registerElement
    class XInline extends XElement {

        static readonly is: string = name;

        constructor() {
            super();
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
