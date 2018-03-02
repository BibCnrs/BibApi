const doiRegex = new RegExp(
    '(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)',
);

export default term => (term ? !!term.match(doiRegex) : false);
