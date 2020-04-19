
const toList = (json) => {
    let result = "";
    for (const property in json) {
        if (typeof json[property] === "object") {
            result += `<li class="ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block collapsible" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                <span class="expander property">${property}</span>
                <ul class="nested">${toList(json[property])}</ul>
            </li>`;
        } else {
            result += `<li class="item ml-6">
                <span class="property">${property}</span>
                <span class="value">${json[property]}</span>
            </li>`;
        }
    }
    return result;
};

module.exports = {
    toHTML(json) {
        try {
            let result = toList(JSON.parse(json));

            return `<ul class="list-tree select-none">${result}</ul>`;
        } catch (e) {
            console.log("INVALID JSON");
        }
    }
};
