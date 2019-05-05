
import { html, directive, isDirective, AttributePart } from "lit-html";
import XElement, { registerElement, assign, $, property, supportXType, lifetime, update } from "./XElement";
import bind from 'bind-decorator';

@registerElement
export default class DigitalClock extends XElement {

    constructor() {
        super(html);
    }

    static readonly is = "x-digitalclock";

    static time: Date;

    @property()
    @lifetime(update, Date, 1000)
    time: Date;

    render() {
        return this.time;
    }
};

export const DigitalClockX = supportXType(DigitalClock);
