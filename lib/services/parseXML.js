import _ from 'lodash';
import { Readable } from 'stream';
import flow from 'xml-flow';
import { AllHtmlEntities } from 'html-entities';
const entities = new AllHtmlEntities();


// export function extractSearchLink(field) {
//     const regEx = /<searchLink.*?fieldCode="(.*?)".*?term="(.*?)".*?>(.*?)<\/.?searchLink>\s?(?:<(?:(?:relatesTo)|(?:superscript)).*?>(.*?)<\/.?(?:(?:relatesTo)|(?:superscript))>)?/gi;
//
//     function loop(result = []) {
//         const match = regEx.exec(field);
//         if(!match) {
//             return result;
//         }
//
//         return loop([
//             ...result,
//             {
//                 field: match[1],
//                 term: decodeURIComponent(match[2]).replace(/\+/g, ' '),
//                 value: match[3],
//                 indice: match[4]
//             }
//         ]);
//     }
//
//     return loop();
// }
//
// export function extractFirstValue(field) {
//     const regEx = /<.*>.*<\/.*>.*?$/;
//
//     return _.trim(field.replace(regEx, ''), ' ;');
// }
//
// export function extractLastValue(field) {
//     const regEx = /^.*?<.*>.*<\/.*>/;
//
//     return _.trim(field.replace(regEx, ''), ' ;');
// }
//
// export function extractIndice(field) {
//     const regEx = /<(?:(?:relatesTo)|(?:superscript)).*?>(.*?)<\/.?(?:(?:relatesTo)|(?:superscript))>/g;
//     const match = regEx.exec(field);
//
//     return match && match[1];
// }
//
// export function parseLabelValue(field) {
//     return field.split('<i>')
//     .slice(1)
//     .reduce((result, data) => {
//         const d = data.split(/<\/.?i>/);
//         return {
//             ...result,
//             [_.trim(d[0], ' :')]: parseXMLLine(d[1])
//         };
//     }, {});
// }

export function parseXMLObject(data) {
    if (typeof data === 'string') {
        return _.trim(data, ' -;');
    }
    switch(data.$name) {
    case 'searchlink':
        return {
            term: decodeURIComponent(data.$attrs.term).replace(/\+/g, ' '),
            field: data.$attrs.fieldcode,
            value: data.$text
        };
    case 'relatesto':
    case 'superscript':
        return {
            indice: data.$text
        };
    case 'i':
        return data.$text;
    default:
        return data;
    }
}

export function smartConcat(array, value) {
    if (!value) {
        return array;
    }
    // I current value and last array item are both string join them
    if(typeof value === 'string' && typeof array.slice(-1)[0] === 'string') {
        return [
            ...array.slice(0, -1),
            [...array.slice(-1), value].join(' ')
        ];
    }
    return [
        ...array,
        value
    ];
}

export function parseXMLLine(xmlLine) {
    return new Promise(function (resolve, reject) {
        if(!xmlLine) {
            return resolve(null);
        }
        const s = new Readable();
        s.push(`<root>-${xmlLine}-</root>`);    // ugly add "-" force flow to use $markup format even if string start and end with a tag
        s.push(null);

        const xmlStream = flow(s);
        xmlStream.on('tag:root', function(data) {
            if(data.$text) {
                return resolve(_.trim(data.$text, ' -;'));
            }
            resolve(
                data.$markup
                .map(parseXMLObject)
                .reduce(smartConcat, [])
            );
        })
        .on('error', reject);
    });
}

export default function* parseXML(xml) {
    return yield entities
    .decode(xml)
    .split(/<br.?\/?>|\s;\s/)
    .map(parseXMLLine);
}
