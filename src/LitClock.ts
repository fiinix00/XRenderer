
import { html, svg, SVGTemplateResult } from "lit-html";

import XElement, { registerElement, uses } from "./XElement";
import cxsStyle from "./cxsstyle";
import DogList from "./DogList";

import { square, clockFace, hour, minute, secondColor, secondCounterWeight, minor, major } from "./LitClock.style";

@registerElement
@uses(DogList)
export default class LitClock extends XElement {

    static readonly is: string = "x-lit-clock";

    private _date: Date = new Date();

    get date() { return this._date; }
    set date(v) { this._date = v; this.invalidate(); }

    constructor() {
        super();

        const updateDate = () => {
            this.date = new Date();
        };

        updateDate();
        setInterval(updateDate, 1000 / 1 /*fps*/); 
    }

    //<g transform='rotate(${ 6 * this.date.getSeconds()})'> 
    //+ this.date.getMilliseconds() / 165
    
    render() {
        return html`
            
        <style>
            ${cxsStyle()}
        </style>

        <style>
            :host {
                display: block;
            }

            svg {
                position: absolute;
                width: 100%;
                height: 100%;
            }
        </style>

        <div class='${square}'> <!-- so the SVG keeps its aspect ratio -->

            <x-dog-list></x-dog-list>
            
            <svg viewBox='0 0 100 100'>
            
                <!-- first create a group and move it to 50,50 so
                    all co-ords are relative to the center -->
                <g transform='translate(50,50)'>
                    <circle class='${clockFace}' r='48'/>
                    ${minuteTicks}
                    ${hourTicks}
            
                    <!-- hour hand -->
                    <line class='${hour}' y1='2' y2='-20'
                    transform='rotate(${ 30 * this.date.getHours() + this.date.getMinutes() / 2})'/>
            
                    <!-- minute hand -->
                    <line class='${minute}' y1='4' y2='-30'
                    transform='rotate(${ 6 * this.date.getMinutes() + this.date.getSeconds() / 10})'/>
            
                    <!-- second hand -->
                    <g transform='rotate(${ 6 * this.date.getSeconds() })'>
                        <line class='${secondColor}' y1='10' y2='-38'/>
                        <line class='${secondColor} ${secondCounterWeight}' y1='10' y2='2'/>
                    </g>
                </g>
            </svg>
        </div>`;
    }
}

const minuteTicks = (() => {
    const lines = <SVGTemplateResult[]>[];

    for (let i = 0; i < 60; i++) {
        lines.push(svg`<line class='${minor}' y1='42' y2='45' transform='rotate(${360 * i / 60})'/>`);
    }

    return lines;
})();

const hourTicks = (() => {
    const lines = <SVGTemplateResult[]>[];

    for (let i = 0; i < 12; i++) {
        lines.push(svg`<line class='${major}' y1='32' y2='45' transform='rotate(${360 * i / 12})'/>`);
    }

    return lines;
})();
