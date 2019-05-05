
import { html } from "lit-html";
import XElement, { registerElement, $, assign, property } from "./XElement";
import XInline from "./XInline";
import bind from "bind-decorator";

const List = XInline<{ items: string[] }>("x-list", ["items"], self =>
    (<ul>
        {self.items.map((item, index) =>
            <li key={assign(index)}>{item}</li>
        )}
    </ul>)
);

@registerElement
class Todo extends XElement {

    constructor() {
        super(html);
    }

    static readonly is: string = "x-todo";
    
    @property()
    term: string = "";

    @property()
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
        return (
            <div>

                <form onsubmit={assign(this._onsubmit)}>
                    <input value={assign(this.term)} onchange={assign(this._onchange)} />
                    <button>Submit</button>
                </form>

                <List items={assign(this.items)} />
                
            </div>
        );
    }
}

export default Todo;
