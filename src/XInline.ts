import XElement, { registerElement, Is, property } from "./XElement";
import { AttributePart, TemplateResult, directive, html } from "lit-html";

export default function XInline<TExtend>(name: string, properties: string[], renderer: (self: XElement & TExtend) => TemplateResult) {

    function defineProperties(setup: XInline, properties: string[]) {
        for (var i = 0; i < properties.length; i++) {

            const prop = properties[i];
            
            property()(setup, prop);
        }
    }

    @registerElement
    class XInline extends XElement {

        static readonly is: string = name;

        constructor() {
            super(html);
        }

        render() {
            return renderer(this as unknown as XElement & TExtend);
        }
    }

    defineProperties(XInline.prototype, properties);

    const component = XInline as unknown as XElement & TExtend & { new(props: TExtend): XElement, is: string; };

    return component;
}
