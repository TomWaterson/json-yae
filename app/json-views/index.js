
const toList = (json) => {
    let result = "";
    for (const property in json) {
        if (typeof json[property] === "object") {
            result += `<li class="collapsible-item"><span class="property">${property}</span> : <ul class="collapsible">${toList(json[property])}</ul></li>`;
        } else {
            result += `<li class="item"><span class="property">${property}</span> : <span class="value">${json[property]}</span></li>`;
        }
    }
    return result;
};

module.exports = {
    toHTML(json) {
        console.log(json);
        try {
            let result = toList(JSON.parse(json));

            return `<ul>${result}</ul>`;
        } catch (e) {
            console.log("INVALID JSON");
        }
    }
};
