export default function cleanXml(data) {
    return data
        .replace(/&lt;/g, '<') // unescape '<'
        .replace(/&gt;/g, '>') // and '>'
        .replace(/<br.?\/?>/gi, '\n') // replace br tag by linefeed
        .replace(/<.*?>/g, ''); // remove xml tag if any;
}
