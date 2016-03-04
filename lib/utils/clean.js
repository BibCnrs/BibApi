import cleanXml from './cleanXml';
import { AllHtmlEntities } from 'html-entities';
const entities = new AllHtmlEntities();

export default function clean(text) {
    return entities.decode(cleanXml(text));
}
