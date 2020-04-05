const validate = (input) => {
    try {
        JSON.parse(input);
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = {
    validate
};
