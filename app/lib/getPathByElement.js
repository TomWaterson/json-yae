const getPathByElement = (ele, result = "") => {
    let parent = ele.parentElement;
    let property = parent.querySelector(".property").textContent;

    if (parent.parentElement.classList.value.split(" ").includes("nested")) {
        let propertyElement = parent.parentElement.parentElement.querySelector(".property");

        return getPathByElement(propertyElement, property + "." + result);
    } else {
        return property + "." + result;
    }
};

module.exports = getPathByElement;