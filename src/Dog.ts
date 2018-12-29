
import { html } from "lit-html";
import XElement, { registerElement } from "./XElement";

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

    set name(newName: string) {
        if (this.differs(this._name, newName)) {
            this._name = newName;
            this.updateVersion();
        }
    }

    get age(): number { return this._age; }

    set age(newAge: number) {
        if (this.differs(this._age, newAge)) {
            this._age = newAge;
            this.updateVersion();
        }
    }

    render() {
        const data = <Dog>this.data;

        return html`<p>Dog ${data.name} = ${data.age}</p>`;
    }
}
