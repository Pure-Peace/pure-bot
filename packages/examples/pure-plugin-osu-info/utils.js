const specialChars = {
    '&': '&amp;',
    '[': '&#91;',
    ']': '&#93;',
    ',': '&#44;'
};
function unescapeSpecialChars (chars) {
    chars = chars.toString();
    Object.entries(specialChars).forEach(([replace, find]) => {
        chars = chars.split(find).join(replace);
    });
    return chars;
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
    unescapeSpecialChars,
    wait
};
