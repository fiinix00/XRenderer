
import { html } from "lit-html";
import XElement, { registerElement } from "./XElement";

@registerElement
export default class XRef extends XElement<XElement> {

    static readonly is: string = "x-ref";
    
    render() {
        const child = this._shadowRoot.firstChild;

        if (child !== null) {
            this._shadowRoot.removeChild(child);
        }

        this._shadowRoot.appendChild(this.data);

        return null;
    }
}
