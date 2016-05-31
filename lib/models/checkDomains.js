export default function checkDomains(wantedDomains, existingDomains) {
    if (wantedDomains.length !== existingDomains.length) {
        const missindDomains = wantedDomains.filter(domain => existingDomains.map(domain => domain.name).indexOf(domain) === -1);
        throw new Error(`Domains ${missindDomains.join(', ')} does not exists`);
    }
}
