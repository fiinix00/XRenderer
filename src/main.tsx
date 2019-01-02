
import { html } from "lit-html";
import XElement, { registerElement, $ } from "./XElement";

import { TodoX } from "./Todo";
import { LitClockX } from "./LitClock";
import { DogListX } from "./DogList";

@registerElement
export class Main extends XElement {

    static readonly is: string = "x-main";
    
    render() {
        return $(
            <host>
                <x type={TodoX}></x>
                <x type={DogListX}></x>
                <x type={LitClockX}></x>
            </host>
        )!;
    }
}
