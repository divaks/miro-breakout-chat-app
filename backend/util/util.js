function getLocalDateFromISODate(isoDate) {
    return (new Date(isoDate)).toLocaleString();
};

module.exports.getLocalDateFromISODate = getLocalDateFromISODate;