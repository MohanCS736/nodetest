const moment = require("moment");

module.exports.checkResourceIsExpired = async (resource) => {
  try {
    // Assuming 'resource' has a 'createdAt' property representing its creation date
    const createdDate = moment(resource.activatedAt);
    const currentDate = moment();

    // Calculate the difference in months between the current date and the creation date
    const monthsDifference = currentDate.diff(createdDate, "months");

    // Check if the difference is greater than or equal to 12 months
    return monthsDifference >= 12;
  } catch (error) {
    console.error("Error checking resource expiration:", error);
    throw error;
  }
};

module.exports.secondsToHMS = (seconds) => {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  var formattedTime = [
    padWithZero(hours),
    padWithZero(minutes),
    padWithZero(remainingSeconds),
  ].join(":");

  return formattedTime;
};
function padWithZero(number) {
  return (number < 10 ? "0" : "") + number;
}
