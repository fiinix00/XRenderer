import { TemplateResult } from "lit-html";
import XElement from "./XElement";

declare module JSX {
    type Element = (self: XElement) => TemplateResult;
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}