
import { html, AttributePart } from "lit-html";
import XElement, { registerElement, IVersionId, uses, assign } from "./XElement";
import Dog from "./Dog";
import XDOM from "./XDOM";

@uses(XDOM)
@registerElement
export default class DogList extends XElement {

    static readonly is: string = "x-dog-list";

    private readonly dogs: Dog[];
    
    constructor() {
        super();

        this.dogs = [
            new Dog("Pupper", 10),
            new Dog("Woofer", 20),
        ];
    }
    
    render() {
        return html`
            <ul class="dogs">
                ${this.dogs.map(dog => {
                    return html`<x-dom element="${assign(dog)}" />`;
                })}
            </ul>`;
    }
}
