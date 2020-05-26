const flyd = require("flyd");
const Prism = require("prismjs");

const TextArea = (__, dependantStreams) => {
    let { inputJSONStream } = dependantStreams;

    const inputJSON = document.querySelector("#inputJSON");
    inputJSON.addEventListener("input", (e) => inputJSONStream(e.target.value));

    flyd.on((value) => {
        // Returns a highlighted HTML string
        const html = value ? Prism.highlight(value, Prism.languages.javascript, "javascript") : "";
        document.querySelector("#outputJSON").innerHTML = html;

        Prism.highlightAll();
    }, inputJSONStream);

    flyd.on((data) => {
        inputJSON.value = data;
    }, inputJSONStream);
};

module.exports = { TextArea };
