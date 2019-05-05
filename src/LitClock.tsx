
import { html, svg, SVGTemplateResult } from "lit-html";

import { cache } from "lit-html/directives/cache";

import XElement, { registerElement, uses, $, property } from "./XElement";
//import cxsStyle from "./cxsstyle";

import { square, clockFace, hour, minute, secondColor, secondCounterWeight, minor, major } from "./LitClock.style";

@registerElement
export default class LitClock extends XElement {

    static readonly is: string = "x-litclock";

    @property()
    private date: Date = new Date();
    
    static interval: number = -1;
    static clocks: LitClock[] = [];

    static updateAllClocks() {
        var date = new Date();

        for (var i = 0; i < LitClock.clocks.length; i++) {
            LitClock.clocks[i].date = date;
        }
    }

    constructor() {
        super(html);

        this.style.cssFloat = "left";

        LitClock.clocks.push(this);

        if (LitClock.interval === -1) {
            LitClock.interval = setInterval(LitClock.updateAllClocks, 1000 / 1 /*fps*/); 
        }
    }

    //<g transform='rotate(${ 6 * this.date.getSeconds()})'> 
    //+ this.date.getMilliseconds() / 165
    
    static hostStyle: string = `
        :host { display: inline; }
        svg {
            width: 33px;
            height: 33px;
        }
    `;

    render() {
        return $(<host>
            <style>
                ${LitClock.hostStyle}
            </style>

            <div class={square}>

                {/* so the SVG keeps its aspect ratio */}
                <svg viewBox='0 0 100 100'>

                    {/*first create a group and move it to 50,50 so all co-ords are relative to the center */}
                    <g transform='translate(50,50)'>
                        <circle class={clockFace} r='48' />
                        ${minuteTicks}
                        ${hourTicks}

                        {/*hour hand*/}
                        <line class={hour} y1='2' y2='-20'
                            transform='rotate(${ 30 * this.date.getHours() + this.date.getMinutes() / 2})' />

                        {/*minute hand*/}
                        <line class={minute} y1='4' y2='-30'
                            transform='rotate(${ 6 * this.date.getMinutes() + this.date.getSeconds() / 10})' />

                        {/*second hand*/}
                        <g transform='rotate(${ 6 * this.date.getSeconds() })'>
                            <line class={secondColor} y1='10' y2='-38' />
                            <line class='${secondColor} ${secondCounterWeight}' y1='10' y2='2' />
                        </g>
                    </g>
                </svg>
            </div>
        </host>)!;
    }

    connectedCallback() {
        super.connectedCallback();
        LitClock.clocks.push(this);
    }

    private static arrayRemove<T>(array: Array<T>, value: T) {
        for (var i = array.length; i--;) {
            if (array[i] === value) {
                array.splice(i, 1);
                break;
            }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        LitClock.arrayRemove(LitClock.clocks, this);
    }
}

const minuteTicks = (() => {
    const lines = [] as string[];

    for (let i = 0; i < 60; i++) {
        lines.push(`<line class='${minor}' y1='42' y2='45' transform='rotate(${360 * i / 60})'/>`);
    }
    
    const joined = lines.join("");
    const value = svg([joined] as unknown as TemplateStringsArray);
    
    return cache(value);
})();

const hourTicks = (() => {
    const lines = [] as string[];

    for (let i = 0; i < 12; i++) {
        lines.push(`<line class='${major}' y1='32' y2='45' transform='rotate(${360 * i / 12})'/>`);
    }

    const joined = lines.join("");
    const value = svg([joined] as unknown as TemplateStringsArray);

    return cache(value);
})();
