
import { html, directive, isDirective, AttributePart } from "lit-html";
import XElement, { registerElement, assign, $ } from "./XElement";
import bind from 'bind-decorator';

@registerElement
export default class Dog extends XElement {

    static readonly is: string = "x-dog";

    private _name: string;
    private _age: number;

    constructor(name: string = undefined, age: number = undefined) {
        super();

        this._name = name;
        this._age = age;
    }

    get name(): string { return this._name; }

    set name(value: string) {
        if (this.differs(this._name, value)) {
            this._name = value;
            this.dataChanged();
        }
    }

    get age(): number { return this._age; }

    set age(value: number) {
        if (this.differs(this._age, value)) {
            this._age = value;
            this.dataChanged();
        }
    }

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
