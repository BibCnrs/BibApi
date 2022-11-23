import _ from 'lodash';
import { Readable } from 'stream';
import flow from 'xml-flow';
import { AllHtmlEntities } from 'html-entities';

const entities = new AllHtmlEntities();

export function parseXMLObject(data) {
    if (typeof data === 'string') {
        return _.trim(data, ' -;');
    }
    switch (data.$name) {
        case 'searchlink': {
            const term = decodeURIComponent(data.$attrs.term).replace(
                /\+/g,
                ' ',
            );
            return {
                term,
                field: data.$attrs.fieldcode,
                value: data.$text || term,
            };
        }
        case 'relatesto':
        case 'superscript':
            return {
                indice: data.$text,
            };
        case 'externallink':
            return {
                url: data.$attrs.term,
                value: data.$text,
            };
        case 'link':
            return {
                url: data.$attrs ? data.$attrs.linkterm : data.linkterm,
                value: data.$text,
            };
        case 'subscript':
            return {
                subIndice: data.$text,
            };
        case 'inline-formula':
            return {
                notation: data['tex-math'].$attrs.notation,
                value: data['tex-math'].$text.slice(1, -1), // remove $ delimiter
            };

        // We catch some html tag in the xml (due to some editor)
        case 'i':
        case 'b':
        case 'strong':
        case 'span':
        case 'p':
        case 'em':
        case 'bold':
            return data.$text;
        case 'a': {
            return {
                url: data.$attrs.href,
                value: data.$text,
            };
        }
        default:
            return data;
    }
}

export function smartConcat(array, value) {
    if (!value) {
        return array;
    }
    // If current value and last array item are both string join them
    if (typeof value === 'string' && typeof array.slice(-1)[0] === 'string') {
        return [...array.slice(0, -1), [...array.slice(-1), value].join(' ')];
    }
    return [...array, value];
}

export function parseXMLLine(xmlLine) {
    return new Promise(function (resolve, reject) {
        if (!xmlLine) {
            return resolve(null);
        }
        const s = new Readable();
        s.push(`<root>-${xmlLine}-</root>`); // ugly add "-" force flow to use $markup format even if string start and end with a tag
        s.push(null);

        const xmlStream = flow(s);
        xmlStream.on('tag:root', function (data) {
            try {
                if (data.$text) {
                    return resolve(_.trim(data.$text, ' -;'));
                }
                resolve(
                    data.$markup.map(parseXMLObject).reduce(smartConcat, []),
                );
            } catch (error) {
                reject(error);
            }
        });
        xmlStream.on('error', reject);
        xmlStream.on('end', () => resolve(xmlLine));
    });
}

export function parseXMLArticle(xml, title) {
    const html = entities
        .decode(xml)
        .replace(/<title/g, '<h1')
        .replace(/title>/g, 'h1>')
        .replace(/<hd/g, '<h2')
        .replace(/hd>/g, 'h2>')
        .replace(/<ulist/g, '<ul')
        .replace(/ulist>/g, 'ul>')
        .replace(/<item/g, '<li')
        .replace(/item>/g, 'li>');

    return `<html>
    <head>
        <title>${title}</title>
    </head>
    <body>
        ${html}
    </body>
</html>`;
}

export default function* parseXML(xml) {
    return yield entities
        .decode(xml)
        .split(/<br.?\/?>|\s;\s/)
        .map(parseXMLLine);
}
