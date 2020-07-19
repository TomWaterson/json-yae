const flyd = require("flyd");
const filter = require("flyd/module/filter");
const dot = require("dot");
const _ = require("../../lib/index.js");

const FormUpdateValue = (__, dependantStreams) => {
    let {
        appJSONStream,
        listJSONClickStream,
        objPathStream
    } = dependantStreams;

    const updateJSONValueClickStream = flyd.stream();
    const updateJSON = document.querySelector("#form-value-update-button");
    const listJSON = document.querySelector("#listJSON");
    let listEditor = document.querySelector("#form-value-tree-editor");
    let listEditorContent = document.querySelector("#form-value-tree-editor-content");

    updateJSON.addEventListener("click", updateJSONValueClickStream);
    listJSON.addEventListener("click", listJSONClickStream);

    let template = `<div class="w-full float-r">
        <div class="block mb-6">
            <div>
                <label for="select-type" class="block text-gray-500 font-bold text-left mb-1 mb-0 pr-4">Modify Value Type:</label>
                <select id="select-type" class="bg-gray-200 border-2 border-gray-200 rounded w-1/2 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500">
                    <option selected="selected" value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                </select>
            </div>
        </div>
        <div class="block mb-6">
            <div>
                <label for="json-value" class="block text-gray-500 font-bold text-left mb-1 mb-0 pr-4">Modify value: {{=it.value}}</label>
                <input id="initial-property" type="hidden" value="{{=it.property}}" />
                <input id="initial-value" type="hidden" value="{{=it.value}}" />
                <input id="modify-type" type="hidden" value="value" />
            </div>
            <div>
                <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="json-value" type="text" name="json-value" id="json-value" required>
            </div>
        </div>
    </div>`;

    let render = dot.template(template);

    const convertValue = (type, value) => {
        switch (type) {
        case "string":
            return value;
        case "number":
            return Number(value);
        case "boolean":
            return value === "true" ? true : false;
        default:
            return value;
        }
    };

    // Side-effects

    const listJSONValueClicks = filter(event => {
        let el = event.target;
        let classList = el.classList.value.split(" ");
        if (classList.includes("value")) {
            return true;
        }
        return false;
    }, listJSONClickStream);

    // TODO: separate into own file
    const listJSONCollapsibleClicks = filter(event => {
        let el = event.target;
        let classList = el.classList.value.split(" ");
        if (classList.includes("collapsible")) {
            return true;
        }
        return false;
    }, listJSONClickStream);

    flyd.on(event => {
        let el = event.target;
        let parentEl = el.parentElement;
        let nested = parentEl.querySelector(".nested");
        if (nested) {
            if (nested.classList.value.split(" ").includes("hidden")) {
                nested.classList.remove("hidden");
            } else {
                nested.classList.add("hidden");
            }
        }
    }, listJSONCollapsibleClicks);

    // Update value and refresh the dom
    flyd.on(event => {
        let el = event.target;
        let parentEl = el.parentElement;
        let path = _.compose(_.trimEnd (1), _.getPathByElement);

        objPathStream(path(el));
        listEditor.classList.remove("hidden");
        listEditorContent.innerHTML = render({
            property: parentEl.querySelector(".property").textContent,
            value: parentEl.querySelector(".value").textContent
        });
    }, listJSONValueClicks);

    flyd.on((e) => {
        e.preventDefault();
        let inputValue = document.querySelector("#json-value").value;
        
        // Below should be a promise
        let selectedValue = document.querySelector("#select-type").value;
        let converted = convertValue(selectedValue, inputValue); // Need to preserve type: TODO Add new component to use better API
        let jsonCopy = _.setValue(JSON.parse(appJSONStream()), objPathStream().split("."), converted);
        appJSONStream(JSON.stringify(jsonCopy, null, 4)); // update with new object
        listEditor.classList.add("hidden");
    }, updateJSONValueClickStream);
};

module.exports = { FormUpdateValue };
