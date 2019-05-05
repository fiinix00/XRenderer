
import { html } from "lit-html";
import XElement, { registerElement } from "./XElement";

@registerElement
export default class XDOM<TElement extends XElement> extends XElement {

    static readonly is: string = "x-dom";

    constructor() {
        super(html);
    }

    public element: TElement;

    render() {
        const child = this._shadowRoot.firstChild;

        if (child !== null) {
            this._shadowRoot.removeChild(child);
        }

        this._shadowRoot.appendChild(this.element);

        return null;
    }
}
