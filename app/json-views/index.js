const dot = require("dot");

const toList = (json) => {
    let template = `
        {{ for(var prop in it.data) { }}
            {{? typeof it.data[prop] === "object" }}
                <li data-meta="{{=typeof it.data[prop]}}" class="ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block collapsible" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    <span class="expander property">{{=prop}}</span>
                    <span class="add"><svg class="w-4 h-4 inline-block collapsible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M11 9V5H9v4H5v2h4v4h2v-4h4V9h-4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/></svg></span>
                    <span class="delete"><svg class="w-4 h-4 inline-block collapsible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm5-11H5v2h10V9z"/></svg></span>
                    <ul class="nested">{{=it.template({ template: it.template, data: it.data[prop] })}}</ul>
                </li>
            {{?}}
            {{? typeof it.data[prop] !== "object" }}
                <li data-meta="{{=typeof it.data[prop]}}" class="item ml-6">
                    <span class="property">{{=prop}}</span>
                    <span class="value">{{=it.data[prop]}}</span>
                </li>
            {{?}}
        {{ } }}
    `;
    const render = dot.template(template);
    return render(json);
};

module.exports = {
    toHTML(json) {
        try {
            return `<ul class="list-tree select-none">${toList({ data: JSON.parse(json), template: toList })}</ul>`;
        } catch (e) {
            return null;
        }
    }
};
