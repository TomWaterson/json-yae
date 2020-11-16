const flyd = require("flyd");
const filter = require("flyd/module/filter");
const _ = require("../../lib/index.js");
const { form, div, button, label, select, option, input } = require("hyperaxe");

const FormUpdateValue = (__, dependantStreams) => {
    let {
        appJSONStream,
        listJSONClickStream,
        objPathStream
    } = dependantStreams;

    const updateJSONValueClickStream = flyd.stream();
    const templateFormValueTreeEditor = document.querySelector("#template-form-value");
    const listJSON = document.querySelector("#listJSON");

    listJSON.addEventListener("click", listJSONClickStream);

    const formContent = ({ value, property }) => div(
        { classList: "w-full float-r" },
        div({ classList: "block mb-6" },
            div(
                {},
                label(
                    {
                        for: "select-type",
                        classList: "block text-gray-500 font-bold text-left mb-1 mb-0 pr-4"
                    }, "Modify Value Type:"
                ),
                select(
                    {
                        id: "select-type",
                        classList: "select-form"
                    },
                    option({ value: "string", selected: true }, "String"),
                    option({ value: "number" }, "Number"),
                    option({ value: "boolean" }, "Boolean")
                )
            )
        ),
        div(
            {
                classList: "block mb-6"
            },
            div(
                {},
                label({ for: "json-value", classList: "block text-gray-500 font-bold text-left mb-1 mb-0 pr-4" }, `Modify value: ${value}`),
                input({ id: "initial-property", type:"hidden", value: `${property}` }),
                input({ id: "initial-value", type:"hidden", value: `${value}` }),
                input({ id: "modify-type", type: "hidden", value: "value" })
            ),
            div(
                {},
                input(
                    {
                        classList: "bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500",
                        id: "json-value",
                        name: "json-value",
                        required: true
                    }
                )
            )
        )
    );

    const view = ({ show, value, property }) => form(
        { classList: `${show ? "" : "hidden"} mt-2`, id: "form-value-tree-editor" },
        div({ id: "form-value-tree-editor-content" }, formContent({ value, property })),
        div({ classList: "block mb-6" },
            button(
                {
                    classList: "btn btn-blue",
                    id: "form-value-update-button",
                    type: "submit",
                    onclick: updateJSONValueClickStream
                }, "Update JSON"
            )
        )
    );

    templateFormValueTreeEditor.appendChild(view({ show: false, value: "", property: "" }));

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

    const listJSONValueClicks = filter(event => {
        let el = event.target;
        let classList = el.classList.value.split(" ");
        if (classList.includes("value")) {
            return true;
        } else {
            return false;
        }
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

    flyd.on(event => {
        let el = event.target;
        let parentEl = el.parentElement;
        let path = _.compose(_.trimEnd (1), _.getPathByElement);

        objPathStream(path(el));
        templateFormValueTreeEditor.replaceChild(view({
            show: true,
            property: parentEl.querySelector(".property").textContent,
            value: parentEl.querySelector(".value").textContent
        }), document.querySelector("#form-value-tree-editor"));
    }, listJSONValueClicks);

    flyd.on((e) => {
        e.preventDefault();
        // Below should be a promise that we flatten and the work passed off to a webworker.
        let inputValue = document.querySelector("#json-value").value;
        let selectedValue = document.querySelector("#select-type").value;
        let converted = convertValue(selectedValue, inputValue); // Need to preserve type: TODO Add new component to use better API
        let jsonCopy = _.setValue(JSON.parse(appJSONStream()), objPathStream().split("."), converted);
        appJSONStream(JSON.stringify(jsonCopy, null, 4)); // update with new object
        templateFormValueTreeEditor.replaceChild(view({
            show: false,
            property: "",
            value: ""
        }), document.querySelector("#form-value-tree-editor"));
    }, updateJSONValueClickStream);
};

module.exports = { FormUpdateValue };
