
import { html, AttributePart, TemplateResult } from "lit-html";
import XElement, { registerElement, IVersionId, uses, assign, $, supportXType } from "./XElement";
import Dog from "./Dog";

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
        return $(
            <ul class="dogs">
                ${this.dogs}
            </ul>
        )!;
    }
}

export const DogListX = supportXType(DogList);
