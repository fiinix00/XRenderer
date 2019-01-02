
import { html } from "lit-html";
import XElement, { registerElement, $, assign, supportXType } from "./XElement";
import XInline from "./XInline";

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

    private _items: Array<string> = ["hello"];
    private _term: string = "";

    get term(): string { return this._term; }

    set term(value: string) {
        if (this.differs(this._term, value)) {
            this._term = value;
            this.dataChanged();
        }
    }

    get items(): Array<string> { return this._items; }

    set items(value: Array<string>) {
        this._items = value;
        this.dataChanged();
    }

    onchange = (event) => {
        this.term = event.target.value;
    }

    onsubmit = (event) => {
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

                <form onsubmit={assign(this.onsubmit)}>
                    <input value={assign(this.term)} onchange={assign(this.onchange)} />
                    <button>Submit</button>
                </form>
                
                <x type={List} items={assign(this.items)}></x>
            </div>
        )!;
    }
}

export const TodoX = supportXType(Todo);
