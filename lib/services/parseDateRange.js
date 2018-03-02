export default function parseDateRange(results) {
    if (
        !results ||
        !results.AvailableCriteria ||
        !results.AvailableCriteria.DateRange
    ) {
        return {
            min: 1000,
            max: new Date().getFullYear() + 1,
        };
    }
    const { MinDate, MaxDate } = results.AvailableCriteria.DateRange;

    return {
        min: parseInt(MinDate.substr(0, 4), 10),
        max: Math.min(MaxDate.substr(0, 4), new Date().getFullYear() + 1),
    };
}
