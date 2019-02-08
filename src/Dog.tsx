
import { html, directive, isDirective, AttributePart } from "lit-html";
import XElement, { registerElement, assign, $, getset } from "./XElement";
import bind from 'bind-decorator';

@registerElement
export default class Dog extends XElement {

    static readonly is: string = "x-dog";

    constructor(name: string = undefined, age: number = undefined) {
        super();

        this.name = name;
        this.age = age;
    }

    @getset()
    name: string;

    @getset()
    age: number;

    @bind
    increaseAge() {
        this.age++;
    }
    
    render() {
        return $(
            <p onclick={assign(this.increaseAge)}>
                Dog ${this.name} = ${this.age}
            </p>
        )!;
    }
}
