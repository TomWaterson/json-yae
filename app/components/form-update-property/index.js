const flyd = require("flyd");
const filter = require("flyd/module/filter");
const dot = require("dot");
const _ = require("../../lib/index.js");

const FormUpdateProperty = (__, dependantStreams) => {
    let {
        appJSONStream,
        listJSONClickStream,
        objPathStream
    } = dependantStreams;

    const updateJSONPropertyClickStream = flyd.stream();
    const updateJSON = document.querySelector("#form-property-update-button");
    const listJSON = document.querySelector("#listJSON");
    let listEditor = document.querySelector("#form-property-tree-editor");
    let listEditorContent = document.querySelector("#form-property-tree-editor-content");

    updateJSON.addEventListener("click", updateJSONPropertyClickStream);
    listJSON.addEventListener("click", listJSONClickStream);

    const listJSONPropertyClicks = filter(event => {
        let el = event.target;
        let classList = el.classList.value.split(" ");
        if (classList.includes("property")) {
            return true;
        }
        return false;
    }, listJSONClickStream);

    let propertyTemplate = `<div class="w-full float-r">
        <div class="block mb-6">
            <div>
                <label for="json-property" class="block text-gray-500 font-bold text-left mb-1 mb-0 pr-4">Replace Property: {{=it.property}}</label>
                <input id="initial-property" type="hidden" value="{{=it.property}}" />
                <input id="initial-value" type="hidden" value="{{=it.value}}" />
                <input id="modify-type" type="hidden" value="property" />
            </div>
            <div>
                <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="json-property" type="text" name="json-property" required>
            </div>
        </div>
    </div>`;

    let renderPropertyForm = dot.template(propertyTemplate);

    flyd.on((event) => {
        let el = event.target;
        let parentEl = el.parentElement;
        let path = _.compose(_.trimEnd (1), _.getPathByElement);

        objPathStream(path(el));
        listEditor.classList.remove("hidden");
        listEditorContent.innerHTML = renderPropertyForm({
            property: parentEl.querySelector(".property").textContent,
            value: parentEl.querySelector(".value").textContent
        });
    }, listJSONPropertyClicks);

    flyd.on((e) => {
        e.preventDefault();
        let inputValue = document.querySelector("#json-property").value;
        // Below should be a promise
        let jsonCopy = _.setProperty(JSON.parse(appJSONStream()), objPathStream().split("."), inputValue);
        appJSONStream(JSON.stringify(jsonCopy, null, 4));
        listEditor.classList.add("hidden");
    }, updateJSONPropertyClickStream);
};

module.exports = { FormUpdateProperty };
