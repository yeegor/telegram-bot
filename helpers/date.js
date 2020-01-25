module.exports.parse = (inputDate, inputTime) => {
    const dateArray = inputDate.split('/');
    const timeArray = inputTime.split(':');
    const [day, month, year] = dateArray;
    const [hours, minutes] = timeArray;

    return new Date(year, month - 1, day, hours, minutes);
}