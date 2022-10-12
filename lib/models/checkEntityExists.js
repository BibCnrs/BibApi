export default function checkDomains(
    entityName,
    matchingAttr,
    wantedAttrs,
    existingEntities,
) {
    if (wantedAttrs.length === existingEntities.length) {
        return;
    }
    const missing = wantedAttrs.filter(
        (attr) =>
            existingEntities
                .map((entity) => entity[matchingAttr])
                .indexOf(attr) === -1,
    );
    throw new Error(`${entityName} ${missing.join(', ')} does not exists`);
}
