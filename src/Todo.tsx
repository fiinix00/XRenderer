
import { html } from "lit-html";
import XElement, { registerElement, $, assign, supportXType, getset } from "./XElement";
import XInline from "./XInline";
import bind from "bind-decorator";

const List = XInline<{ items: string[] }>("x-list", ["items"], self =>
    $(<ul>
        ${self.items.map((item, index) =>
            $(<li key={assign(index)}>${item}</li>)!
        )}
    </ul>)!!
);

@registerElement
export default class Todo extends XElement {
    
    static readonly is: string = "x-todo";
    
    @getset()
    term: string = "";

    @getset()
    items: string[] = ["hello"];

    @bind
    _onchange(event) {
        this.term = event.target.value;
    }

    @bind
    _onsubmit(event) {
        event.preventDefault();

        this.pauseInvalidation();
        {
            this.items = [...this.items, this.term];
            this.term = "";
        }
        this.resumeInvalidation();
    }
    
    render() {
        return $(
            <div>

                <form onsubmit={assign(this._onsubmit)}>
                    <input value={assign(this.term)} onchange={assign(this._onchange)} />
                    <button>Submit</button>
                </form>
                
                <x type={List} items={assign(this.items)}></x>
            </div>
        )!;
    }
}

export const TodoX = supportXType(Todo);
