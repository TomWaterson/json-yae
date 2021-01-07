const flyd = require("flyd");
const filter = require("flyd/module/filter");
const _ = require("../../lib/index.js");
const { form, div, button, label, input } = require("hyperaxe");

const FormUpdateProperty = (__, dependantStreams) => {
    let {
        appJSONStream,
        listJSONClickStream,
        objPathStream
    } = dependantStreams;

    const updateJSONPropertyClickStream = flyd.stream();
    const listJSON = document.querySelector("#listJSON");
    listJSON.addEventListener("click", listJSONClickStream);
    const templateFormPropertyTreeEditor = document.querySelector("#template-form-property");

    const listJSONPropertyClicks = filter(event => {
        let el = event.target;
        let classList = el.classList.value.split(" ");
        if (classList.includes("property")) {
            return true;
        }
        return false;
    }, listJSONClickStream);

    const formContent = ({ property, value }) => div(
        { classList: "w-full float-r" },
        div(
            { classList: "block mb-6" },
            div(
                {},
                label({ for: "json-property", classList: "block text-gray-500 font-bold text-left mb-1 mb-0 pr-4" }, `Replace Property: ${property}`),
                input({ id: "initial-property", type: "hidden", value: `${property}` }),
                input({ id: "initial-value", type: "hidden", value: `${value}` }),
                input({ id: "modify-type", type: "hidden", value: "property"})
            ),
            div(
                {},
                input({ 
                    classList:"bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500", 
                    id: "json-property",
                    type: "text",
                    name: "json-property",
                    required: true
                })
            )
        )
    );

    const view = ({ show, property, value }) => form(
        { classList: `${show ? "" : "hidden"} mt-2`, id: "form-property-tree-editor" },
        div({ id: "form-property-tree-editor-content" }, formContent({ property, value })),
        div({ classList: "block mb-6"},
            button({ id: "form-property-update-button", classList: "btn btn-blue", type: "submit", onclick: updateJSONPropertyClickStream }, "Update JSON")
        )
    );

    templateFormPropertyTreeEditor.appendChild(view({ show: false, property: "", value: "" }));

    flyd.on((event) => {
        let el = event.target;
        let parentEl = el.parentElement;
        let path = _.compose(_.trimEnd (1), _.getPathByElement);

        objPathStream(path(el));
        templateFormPropertyTreeEditor.replaceChild(view({ 
            show: true, 
            property: parentEl.querySelector(".property").textContent,
            value: parentEl.querySelector(".value").textContent
        }), document.querySelector("#form-property-tree-editor"));
    }, listJSONPropertyClicks);

    flyd.on((e) => {
        e.preventDefault();
        let inputValue = document.querySelector("#json-property").value;
        // Below should be a promise
        let jsonCopy = _.setProperty(JSON.parse(appJSONStream()), objPathStream().split("."), inputValue);
        appJSONStream(JSON.stringify(jsonCopy, null, 4));
        templateFormPropertyTreeEditor.replaceChild(view({ 
            show: false, 
            property: "",
            value: ""
        }), document.querySelector("#form-property-tree-editor"));
    }, updateJSONPropertyClickStream);
};

module.exports = { FormUpdateProperty };
