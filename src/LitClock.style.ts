import cxs from "./cxsmod";

//cxs.pushPrefix("lit");

export const square = cxs({
    position: "relative",
    width: "100%",
    height: "0",
    paddingBottom: "100%"
});

export const major = cxs({
    stroke: "#333",
    strokeWidth: 1
});

export const minor = cxs({
    stroke: "#999",
    strokeWidth: 0.5
});

export const hour = cxs({
    stroke: "#333"
});

export const minute = cxs({
    stroke: "#666"
});

export const secondColor = cxs({
    stroke: "rgb(180,0,0)"
});

export const secondCounterWeight = cxs({
    strokeWidth: 3
})

export const clockFace = cxs({
    stroke: "#333",
    fill: "white"
});

//cxs.popPrefix();