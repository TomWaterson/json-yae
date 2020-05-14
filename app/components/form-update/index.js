const flyd = require("flyd");
const dot = require("dot");
const _ = require("../../lib/index.js");

const FormUpdate = (__, dependantStreams) => {
    let { updateJSONStream, listJSONStream, inputJSONStream, objPathStream } = dependantStreams;

    function setValue(object, path, value) {
        var fullPath = path.split("."),
            way = fullPath.slice(),
            last = way.pop();

        way.reduce(function (r, a) {
            return r[a] = r[a] || {};
        }, object)[last] = value;

        return object;
    }

    function deepCopy(sourceObject, destinationObject) {
        for (const key in sourceObject) {
            if(typeof sourceObject[key] != "object") {
                destinationObject[key] = sourceObject[key];
            } else {
                destinationObject[key] = {};
                deepCopy(sourceObject[key], destinationObject[key]);
            }
        }
        return destinationObject;
    }

    flyd.on((e) => {
        e.preventDefault();

        let value = document.querySelector("#json-value").value;
        let jsonObject = JSON.parse(inputJSONStream());
        let pathToSet = objPathStream();
        let result = setValue(deepCopy(jsonObject, {}), pathToSet, value);

        inputJSONStream(JSON.stringify(result, null, 4)); // update with new object
    }, updateJSONStream); // update json from click.
    // Side-effects
    flyd.on(event => {
        let el = event.target;
        let parentEl = el.parentElement;
        let classList = el.classList.value.split(" ");
        let nested = parentEl.querySelector(".nested");
        let listEditor = document.querySelector("#list-editor");
        let listEditorContent = document.querySelector("#list-editor-content");

        let template = `
        <div class="w-full float-r">
            <div class="block mb-6">
                <div>
                    <label class="block text-gray-500 font-bold text-left mb-1 mb-0 pr-4" for="json-property">Modify property: {{=it.property}}</label>
                    <input id="initial-property" type="hidden" value="{{=it.property}}" />
                </div>
                <div>
                    <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="json-property" type="text" name="json-property" id="json-property" required>
                </div>
            </div>
            <div class="block mb-6">
                <div>
                    <label class="block text-gray-500 font-bold text-left mb-1 mb-0 pr-4" for="json-value">Modify value: {{=it.value}}</label>
                    <input id="initial-value" type="hidden" value="{{=it.value}}" />
                </div>
                <div>
                    <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="json-value" type="text" name="json-value" id="json-value" required>
                </div>
            </div>
        </div>
        `;

        let templateFn = dot.template(template);

        if (classList.includes("property") || classList.includes("value")) {
            let pathByElement = (ele, result = "") => {
                let parent = ele.parentElement;
                let property = parent.querySelector(".property").textContent;

                if (parent.parentElement.classList.value.split(" ").includes("nested")) {
                    let x = parent.parentElement.parentElement.querySelector(".property");

                    return pathByElement(x, property + "." + result);
                } else {
                    return property + "." + result;
                }
            };
            let getPath = _.compose((s) => s.slice(0, s.length - 1), pathByElement);

            let formHTML = templateFn({
                property: parentEl.querySelector(".property").textContent,
                value: parentEl.querySelector(".value").textContent
            });

            let objectFromPath = _.path (getPath(el).split(".")) (JSON.parse(inputJSONStream()));

            if (objectFromPath === undefined) {
                // ITS AN OBJECT DEAL WITH SEPARATELY
            } else {
                // Show Update Form with property and id
                objPathStream(getPath(el));
                listEditor.classList.remove("hidden");
                listEditorContent.innerHTML = formHTML;
            }
        }
        else if (classList.includes("collapsible")) {
            if (nested) {
                if (nested.classList.value.split(" ").includes("hidden")) {
                    nested.classList.remove("hidden");
                } else {
                    nested.classList.add("hidden");
                }
            }
        }
    }, listJSONStream);
};

module.exports = { FormUpdate };
