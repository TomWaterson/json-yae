const flyd = require("flyd");
const Prism = require("prismjs");

const TextArea = (__, dependantStreams) => {
    let { inputJSONStream } = dependantStreams;

    flyd.on((value) => {
        // Returns a highlighted HTML string
        const html = value ? Prism.highlight(value, Prism.languages.javascript, "javascript") : "";
        document.querySelector("#outputJSON").innerHTML = html;

        Prism.highlightAll();
    }, inputJSONStream);
};

module.exports = { TextArea };
