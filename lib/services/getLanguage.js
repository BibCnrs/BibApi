export default (headers) => {
    try {
        const language = headers['accept-language'].split(',')[0].split('-')[0];

        return language === 'fr' ? language : 'en';
    } catch (error) {
        return 'en';
    }
};
