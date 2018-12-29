
import { html } from "lit-html";
import XElement, { registerElement } from "./XElement";
import Dog from "./Dog";

@registerElement
export default class DogList extends XElement {

    static readonly is: string = "x-dogs";

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
            ${this.dogs.map((dog, index) => {
                return html`<x-dog owner="${this.identifier}" storage="${this.nameof(() => this.dogs)}" oindex="${index}" oid=${dog.identifier} oversion="${dog.version}" />`;
            })}
        </ul>`;
    }
}
