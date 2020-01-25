module.exports.parse = (inputDate, inputTime) => {
    const date = inputDate.split('/');
    const time = inputTime.split(':');
    const [day, month, year] = date;
    const [hours, minutes] = time;
    return new Date(year, month, day, hours, minutes);
}