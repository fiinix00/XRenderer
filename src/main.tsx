
import { html, TemplateResult } from "lit-html";
import XElement, { registerElement, $ } from "./XElement";

import { TodoX } from "./Todo";
import { LitClockX } from "./LitClock";
import { DogListX } from "./DogList";
import { cache } from "lit-html/directives/cache";

@registerElement
export class Main extends XElement {

    static readonly is: string = "x-main";
    
    render() {
        return $(
            <host>
                <x type={TodoX}></x>
                <x type={DogListX}></x>
                ${allTheClocks}
            </host>
        )!;
    }
}

const allTheClocks = (function () {

    const items = [] as TemplateResult[];

    for (var i = 0; i < 5; i++) {
        items.push(
            $(<div style="float:left;"><x type={LitClockX}></x></div>)!!
        );
    }

    return cache(items);

})();
