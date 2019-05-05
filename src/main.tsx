
import { html, TemplateResult } from "lit-html";
import XElement, { registerElement, $, uses } from "./XElement";

import Dog from "./Dog";
import Todo from "./Todo";
import LitClock from "./LitClock";
import DogList from "./DogList";
import { cache } from "lit-html/directives/cache";
import DigitalClock from "./DigitalClock";

@registerElement
export class Main extends XElement {

    static readonly is: string = "x-main";

    constructor() {
        super(html);
    }

    render() {
        return (
            <host>
                <Todo />
                <DogList>Hello</DogList>
                <br />
                {allTheClocks}
            </host>
        );
    }
}

const allTheClocks = (function () {

    const items: Node[] = [];

    for (var i = 0; i < 11; i++) {
        items.push(
            <div style="float:left;"><LitClock /></div>
        );
    }

    return cache(items);

})();

document.body.appendChild(new Main());
