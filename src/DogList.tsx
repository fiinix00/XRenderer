
import { html, AttributePart, TemplateResult } from "lit-html";
import XElement, { registerElement, IVersionId, uses, assign, $, supportXType, ref } from "./XElement";
import Dog from "./Dog";
import bind from "bind-decorator";

@registerElement
export default class DogList extends XElement {

    static readonly is: string = "x-doglist";

    private readonly dogs: Dog[];
    private readonly nameInputRef = ref<HTMLInputElement>();
    private readonly ageInputRef = ref<HTMLInputElement>();

    constructor() {
        super(html);

        this.dogs = [
            new Dog("Pupper", 10),
            new Dog("Woofer", 20),
        ];
    }

    @bind
    addNewDog() {

        const { value: name } = this.nameInputRef.get();
        const { value: age } = this.ageInputRef.get();

        this.dogs.push(new Dog(name, parseInt(age)));

        this.dataChanged();
    }

    render() {

        return (
            <host>
                <div>
                    <label for="nameinput">Name</label>
                    <input name="nameinput" ref={this.nameInputRef} />
                </div>

                <div>
                    <label for="ageinput">Age</label>
                    <input name="ageinput" type="number" ref={this.ageInputRef} value="0" />
                </div>

                <button onclick={assign(this.addNewDog)}>Add dog</button>
                <ul class="dogs">
                    {this.dogs}
                </ul>

                <slot />
            </host>
        );
    }
}

export const DogListX = supportXType(DogList);
