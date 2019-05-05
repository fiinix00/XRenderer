declare module JSX {
    type Element = Node;
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}