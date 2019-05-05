
import { html, TemplateResult } from "lit-html";
import XElement, { registerElement, $, uses } from "./XElement";

import Dog from "./Dog";
import Todo, { TodoX } from "./Todo";
import LitClock, { LitClockX } from "./LitClock";
import DogList, { DogListX } from "./DogList";
import { cache } from "lit-html/directives/cache";
import DigitalClock, { DigitalClockX } from "./DigitalClock";

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
