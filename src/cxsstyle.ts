
import cxs from "cxs";

//https://github.com/mleibman/SlickGrid/issues/223 => function findCssRule(selector)

//const prevLength = document.head.children.length;
/*const colorRef = */ /*cxs({ "color": "#000" });
const newLength = document.head.children.length;

const cxsStyleIndex = newLength;

let lastCxsSheetLength = 0;
let lastCxsSheet: String = null;

export const sheet = <CSSStyleSheet>eval(`document.head.children[${cxsStyleIndex - 1}].sheet`);
const styleSheet = sheet.cssRules;

function cxsStyle() {
    const styleSheetLength = styleSheet.length; //Save safe refernece

    if (lastCxsSheetLength === styleSheetLength) {
        return lastCxsSheet;
    }
    else {

        const cssTexts = <string[]>[];

        for (var i = 0; i < styleSheet.length; i++) {
            var curr = styleSheet[i];
            cssTexts.push(curr.cssText);
        }

        lastCxsSheet = cssTexts.join("\n");
        lastCxsSheetLength = styleSheetLength;

        return lastCxsSheet;
    }
}

export default cxsStyle;

*/