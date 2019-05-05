
import { html, directive, isDirective, AttributePart } from "lit-html";
import XElement, { registerElement, assign, $, property } from "./XElement";
import bind from 'bind-decorator';
import cxs from "./cxsmod";

@registerElement
export default class Dog extends XElement {

    static readonly is: string = "x-dog";

    constructor(name: string = undefined, age: number = undefined) {
        super(html);

        this.name = name;
        this.age = age;
    }

    @property()
    name: string;

    @property()
    age: number;

    @bind
    increaseAge() {
        this.age++;
    }
    
    render() {

        return (
            <p onclick={assign(this.increaseAge)} class={cxs({ color: "red" })}>
                {`Dog ${this.name} = ${this.age}`}
            </p>
        );
    }
}
