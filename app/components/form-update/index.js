const flyd = require("flyd");
const filter = require("flyd/module/filter");
const dot = require("dot");
const _ = require("../../lib/index.js");

const FormUpdate = (__, dependantStreams) => {
    let {
        appJSONStream
    } = dependantStreams;
    // Split click logic, and appJSON. No Need to keep the same when updating DOM.
    const listJSONClickStream = flyd.stream();
    const updateJSONClickStream = flyd.stream();
    const objPathStream = flyd.stream();

    const updateJSON = document.querySelector("#update-json");
    const listJSON = document.querySelector("#listJSON");
    let listEditor = document.querySelector("#list-editor");
    let listEditorContent = document.querySelector("#list-editor-content");

    updateJSON.addEventListener("click", updateJSONClickStream);
    listJSON.addEventListener("click", listJSONClickStream);

    let propertyTemplate = `<div class="w-full float-r">
        <div class="block mb-6">
            <div>
                <label for="json-value" class="block text-gray-500 font-bold text-left mb-1 mb-0 pr-4">Replace Property: {{=it.property}}</label>
                <input id="initial-property" type="hidden" value="{{=it.property}}" />
                <input id="initial-value" type="hidden" value="{{=it.value}}" />
                <input id="modify-type" type="hidden" value="property" />
            </div>
            <div>
                <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="json-value" type="text" name="json-value" id="json-value" required>
            </div>
        </div>
    </div>`;

    let renderPropertyForm = dot.template(propertyTemplate);

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

    let getPathByElement = (ele, result = "") => {
        let parent = ele.parentElement;
        let property = parent.querySelector(".property").textContent;

        if (parent.parentElement.classList.value.split(" ").includes("nested")) {
            let propertyElement = parent.parentElement.parentElement.querySelector(".property");

            return getPathByElement(propertyElement, property + "." + result);
        } else {
            return property + "." + result;
        }
    };

    // Side-effects
    // map over event stream and; 
    // split out if/else of object path to different streams :)
    const listJSONPropertyClicks = filter(event => {
        let el = event.target;
        let classList = el.classList.value.split(" ");
        if (classList.includes("property")) {
            return true;
        }
        return false;
    }, listJSONClickStream);

    const listJSONValueClicks = filter(event => {
        let el = event.target;
        let classList = el.classList.value.split(" ");
        if (classList.includes("value")) {
            return true;
        }
        return false;
    }, listJSONClickStream);

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

    flyd.on((event) => {
        let el = event.target;
        let parentEl = el.parentElement;
        let path = _.compose(_.trimEnd (1), getPathByElement);

        objPathStream(path(el));
        listEditor.classList.remove("hidden");
        listEditorContent.innerHTML = renderPropertyForm({
            property: parentEl.querySelector(".property").textContent,
            value: parentEl.querySelector(".value").textContent
        });
    }, listJSONPropertyClicks);
    // Update value and refresh the dom
    flyd.on(event => {
        let el = event.target;
        let parentEl = el.parentElement;
        let path = _.compose(_.trimEnd (1), getPathByElement);

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
        let modifyType = document.querySelector("#modify-type").value;
        listEditor.classList.add("hidden");
        // Seperate if/else into separate forms/modules/files
        if (modifyType == "property") {
            // Below should be a promise
            let jsonCopy = _.setProperty(JSON.parse(appJSONStream()), objPathStream().split("."), inputValue);
            appJSONStream(JSON.stringify(jsonCopy, null, 4));
        } else {
            let selectedValue = document.querySelector("#select-type").value;
            let converted = convertValue(selectedValue, inputValue); // Need to preserve type: TODO Add new component to use better API
            // Below should be a promise
            let jsonCopy = _.setValue(JSON.parse(appJSONStream()), objPathStream().split("."), converted);
            appJSONStream(JSON.stringify(jsonCopy, null, 4)); // update with new object
        }
    }, updateJSONClickStream); // update json from click.
};

module.exports = { FormUpdate };
