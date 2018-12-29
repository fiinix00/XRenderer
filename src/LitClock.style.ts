import cxs from "cxs";

export const square = <string>cxs({
    position: "relative",
    width: "100%",
    height: "0",
    paddingBottom: "100%"
});

export const major = <string>cxs({
    "stroke": "#333",
    "strokeWidth": 1
});

export const minor = <string>cxs({
    "stroke": "#999",
    "strokeWidth": 0.5
});

export const hour = <string>cxs({
    "stroke": "#333"
});

export const minute = <string>cxs({
    "stroke": "#666"
});

export const secondColor = <string>cxs({
    "stroke": "rgb(180,0,0)"
});

export const secondCounterWeight = <string>cxs({
    "strokeWidth": 3
})

export const clockFace = <string>cxs({
    "stroke": "#333",
    "fill": "white"
});
