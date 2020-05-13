const { compose } = require("../lib/index.js");

const toList = (json) => {
    let result = "";
    for (const property in json) {
        if (typeof json[property] === "object") {
            result += `<li data-meta="${typeof json[property]}" class="ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block collapsible" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                <span class="expander property">${property}</span>
                <ul class="nested">${toList(json[property])}</ul>
            </li>`;
        } else {
            result += `<li data-meta="${typeof json[property]}" class="item ml-6">
                <span class="property">${property}</span>
                <span class="value">${json[property]}</span>
            </li>`;
        }
    }
    return result;
};

const toJson = (tree) => {
    let res = {};

    for (let i = 0; i < tree.children.length; i++) {
        let li = tree.children.item(i);

        if (li.attributes["data-meta"].value === "object") {
            let parentProp = li.querySelector(".expander").textContent;
            let nested = li.querySelector(".nested").outerHTML;

            res[parentProp] = compose(toJson, htmlToDOM)(nested);
        } else {
            let prop = li.querySelector(".property").textContent;
            let val = li.querySelector(".value").textContent;

            res[prop] = val;
        }
    }

    return res;
};

const htmlToDOM = (html) => {
    // Create a new dom node template
    var template = document.createElement("template");
    // Add html to new dom node and trim whitespace on the result
    template.innerHTML = html.trim();
    // Get the parant first child for the recursion
    let tree = template.content.firstChild;

    return tree;
};

module.exports = {
    toHTML(json) {
        try {
            let result = compose(toList, JSON.parse);

            return `<ul class="list-tree select-none">${result(json)}</ul>`;
        } catch (e) {
            return null;
        }
    },
    toJSON(html) {
        try {
            let result = toJson(html);

            return result;
        } catch (e) {
            return null;
        }
    }
};
