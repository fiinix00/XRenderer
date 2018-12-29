
import { html } from "lit-html";
import XElement, { registerElement, uses } from "./XElement";
import LitClock from "./LitClock";

@registerElement
@uses(LitClock)
export class Main extends XElement {

    static readonly is: string = "x-main";
    
    constructor() {
        super();
    }

    render() {
        return html`<x-lit-clock></x-lit-clock>`;
    }
}
