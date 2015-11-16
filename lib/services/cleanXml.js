'use strict';

export default function cleanXml(data) {
    return data
    .replace(/&lt;br.?\/?&gt;/gi, '\n') // replace br tag by linefeed
    .replace(/&lt;.*?&gt;/g, '') // remove xml tag if any;
    .replace(/&lt;/g, '<') // usescape '<'
    .replace(/&gt;/g, '>'); // and '>'
}
