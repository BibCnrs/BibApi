'use strict';

var regEx = /\&#([\d]{2,3});/gi;

export default function decodeUnicode(text) {
    if (!text) {
        return text;
    }
    return text.replace(regEx, function (_, code) {
        return String.fromCharCode(parseInt(code, 10));
    });
}
