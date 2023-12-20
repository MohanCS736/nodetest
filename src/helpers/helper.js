const modelsDocumentPermission = require('../models/modelDocumentPermissions');
const subjectsModel = require('../models/subjects');
const trainingTypeModel = require('../models/trainingType');
const usersModel = require('../models/users');
const moment = require('moment');
/*for pagination*/
module.exports.getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0

    return { limit, offset };
};
module.exports.getPaginationData = (data, page, limit) => {
    const { count: totalItems, rows: items } = data;
    const currentPage = page ? ++page : 1;
    const totalPages = Math.ceil(totalItems / limit);
    const itemsPerPage = limit

    return { totalItems, items, currentPage, totalPages, itemsPerPage }
}
//
module.exports.timeDifference = (startDate, endDate) => {
    // Create moment objects from the time strings
    const startTime = moment(startDate, "HH:mm:ss");
    const endTime = moment(endDate, "HH:mm:ss");

    // Calculate the time difference in milliseconds
    const timeDifferenceMilliseconds = endTime.diff(startTime);
    console.log('Start Date : ' + startDate + 'End Date : ' + endDate);
    // Convert the time difference to minutes
    const timeDifferenceMinutes = moment.duration(timeDifferenceMilliseconds).asMinutes();
    return timeDifferenceMinutes;
}
/** get the sorting for users  */
module.exports.getSortingUsers = (sort) => {

    if (sort.sortById) {
        if (sort.sortById == "DESC") return ['id', 'DESC'];
        return ['id', 'ASC']
    }
    if (sort.sortByUsername) {
        if (sort.sortByUsername == "DESC") return ['username', 'DESC'];
        return ['username', 'ASC'];
    }
    if (sort.sortByFirstName) {
        if (sort.sortByFirstName == "DESC") return ['firstName', 'DESC'];
        return ['firstName', 'ASC'];
    }
    if (sort.sortByLastName) {
        if (sort.sortByLastName == "DESC") return ['lastName', 'DESC'];
        return ['lastName', 'ASC'];
    }
    if (sort.sortByEmail) {
        if (sort.sortByEmail == "DESC") return ['email', 'DESC'];
        return ['email', 'ASC'];
    }
    if (sort.sortByPhone) {
        if (sort.sortByPhone == "DESC") return ['phone', 'DESC'];
        return ['phone', 'ASC'];
    }
    if (sort.sortByZipcode) {
        if (sort.sortByZipcode == "DESC") return ['zipcode', 'DESC'];
        return ['zipcode', 'ASC'];
    }
    if (sort.sortByDocAccessLevel) {
        if (sort.sortByDocAccessLevel == "DESC") return [{ model: modelsDocumentPermission }, 'levelName', 'DESC'];
        return [{ model: modelsDocumentPermission }, 'levelName', 'ASC'];
    }
    if (sort.sortByManager) {
        if (sort.sortByManager == "DESC") return [{ model: usersModel, as: "member_manager" }, 'firstName', 'DESC'];
        return [{ model: usersModel, as: "member_manager" }, 'firstName', 'ASC'];
    }
    if (sort.sortByCompany) {
        if (sort.sortByCompany == "DESC") return ['company', 'DESC'];
        return ['company', 'ASC'];
    }
    if (sort.sortByTrainingName) {
        if (sort.sortByTrainingName == "DESC") return ['trainingName', 'DESC'];
        return ['trainingName', 'ASC'];
    }
    if (sort.sortByAddedby) {
        if (sort.sortByAddedby == "DESC") return ['addedByUser', 'DESC'];
        return ['addedByUser', 'ASC'];
    }
    return ['id', 'ASC'];

}
/** get the sorting for subjects */
module.exports.getSortedSubjects = (sort) => {
    if (sort.sortBySubject) {
        if (sort.sortBySubject == "DESC") return ['name', 'DESC'];
        return ['name', 'ASC'];
    }
    return ['id', 'ASC'];
}
// /**get the sorting for cources */
// module.exports.getSortedCourse = (sort)=>{
//     if(sort.sortByCourse){
//         if(sort.sortByCourse=="DESC") return ['name','DESC'];
//         return ['name','ASC'];
//     }
//     if(sort.sortBySubject){
//         if(sort.sortBySubject=="DESC") return [{ model: subjectsModel, as: 'subject' }, 'name', 'DESC'];
//         return [{ model: subjectsModel, as: 'subject' }, 'name', 'ASC'];
//     }
//     return ['id','ASC'];
// }
/** get the sorting for resources */
module.exports.getSortedResource = (sort) => {
    if (sort.sortByResource) {
        if (sort.sortByResource == "DESC") return ['resourceName', 'DESC'];
        return ['resourceName', 'ASC'];
    }
    if (sort.sortByDocument) {
        if (sort.sortByDocument == "DESC") return ['documentName', 'DESC'];
        return ['documentName', 'ASC'];
    }
    if (sort.sortBylevel) {
        if (sort.sortBylevel == "DESC") return ['level', 'DESC'];
        return ['level', 'ASC'];
    }
    if (sort.sortByStatus) {
        if (sort.sortByStatus == "DESC") return ['status', 'DESC'];
        return ['status', 'ASC'];
    }
    if (sort.sortBySubject) {
        if (sort.sortBySubject == "DESC") return [{ model: subjectsModel, as: 'subject' }, 'name', 'DESC'];
        return [{ model: subjectsModel, as: 'subject' }, 'name', 'ASC'];
    }
    if (sort.sortByTrainingType) {
        if (sort.sortByTrainingType == "DESC") return [{ model: trainingTypeModel, as: 'training_type' }, 'trainingName', 'DESC'];
        return [{ model: trainingTypeModel, as: 'training_type' }, 'trainingName', 'ASC'];
    }
    if (sort.sortByLanguage) {
        if (sort.sortByLanguage == "DESC") return ['language', 'DESC'];
        return ['language', 'ASC'];
    }
    if (sort.sortByAddedBy) {
        if (sort.sortByAddedBy == "DESC") return [{ model: usersModel, as: 'addedBy' }, 'email', 'DESC'];
        return [{ model: usersModel, as: 'addedBy' }, 'email', 'ASC'];
        x
    }
    return ['id', 'ASC'];
}

/**get enable disbale filteration for subject and resources */
module.exports.getEnabledDisabled = (view) => {
    if (view.view) {
        switch (view.view) {
            case "enabled": return { view: true }
                break;
            case "disabled": return { view: false }
                break;
            default: return {}
                break;
        }
    }
    return {}
}

/**get sorting for reports section */
module.exports.getSortingReports = (sort) => {
    if (sort.sortByResourceName) {
        if (sort.sortByResourceName == "DESC") return ['resourceName', 'DESC'];
        return ['resourceName', 'ASC'];
    }
    if (sort.sortByName) {
        if (sort.sortByName == "DESC") return ['userName', 'DESC'];
        return ['userName', 'ASC'];
    }
    if (sort.sortByEmail) {
        if (sort.sortByEmail == "DESC") return ['userEmail', 'DESC'];
        return ['userEmail', 'ASC'];
    }
    if (sort.sortByPhoneNumber) {
        if (sort.sortByPhoneNumber == "DESC") return ['phoneNumber', 'DESC'];
        return ['phoneNumber', 'ASC'];
    }
    if (sort.sortByAddress) {
        if (sort.sortByAddress == "DESC") return ['address', 'DESC'];
        return ['address', 'ASC'];
    }
    if (sort.sortByCompany) {
        if (sort.sortByCompany == "DESC") return ['companyName', 'DESC'];
        return ['companyName', 'ASC'];
    }
    if (sort.sortByTakenAt) {
        if (sort.sortByTakenAt == "DESC") return ['createdAt', 'DESC'];
        return ['createdAt', 'ASC'];
    }
    if (sort.sortByViews) {
        if (sort.sortByViews == "DESC") return ['views', 'DESC'];
        return ['views', 'ASC'];
    }
    if (sort.sortByFinish) {
        if (sort.sortByFinish == "DESC") return ['finish', 'DESC'];
        return ['finish', 'ASC'];
    }
    if (sort.sortByFavourites) {
        if (sort.sortByFavourites == "DESC") return ['favourites', 'DESC'];
        return ['favourites', 'ASC'];
    }
    if (sort.sortByDownloads) {
        if (sort.sortByDownloads == "DESC") return ['downloads', 'DESC'];
        return ['downloads', 'ASC'];
    }
    if (sort.sortByDocumentName) {
        if (sort.sortByDocumentName == "DESC") return ['documentName', 'DESC'];
        return ['documentName', 'ASC'];
    }
    if (sort.sortByaddress) {
        if (sort.sortByaddress == "DESC") return ['address', 'DESC'];
        return ['address', 'ASC'];
    }
    if (sort.sortBylevel) {
        if (sort.sortBylevel == "DESC") return ['level', 'DESC'];
        return ['level', 'ASC'];
    }
    if (sort.sortByStatus) {
        if (sort.sortByStatus == "DESC") return ['status', 'DESC'];
        return ['status', 'ASC'];
    }
    if (sort.sortBySubjectName) {
        if (sort.sortBySubjectName == "DESC") return [{ model: subjectsModel, as: 'subject' }, 'name', 'DESC'];
        return [{ model: subjectsModel, as: 'subject' }, 'name', 'ASC'];
    }
    if (sort.sortByTrainingType) {
        if (sort.sortByTrainingType == "DESC") return ['trainingType', 'DESC'];
        return ['trainingType', 'ASC'];
    }
    if (sort.sortByLanguage) {
        if (sort.sortByLanguage == "DESC") return ['language', 'DESC'];
        return ['language', 'ASC'];
    }
    return ['id', 'ASC'];
}

/**get the formated date  */
module.exports.formatDate = (date, type) => {
    let day = '';
    const inputDate = new Date(date);
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Month is zero-based

    if (type === 'end') {
        const lastDay = new Date(year, inputDate.getMonth() + 1, 0);
        day = String(lastDay.getDate()).padStart(2, '0');
    } else {
        day = String(inputDate.getDate()).padStart(2, "0");
    }
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

/** */
module.exports.fetchMonthYear = (startDate, endDate) => {
    const startDates = new Date(startDate);
    const endDates = new Date(endDate);

    const monthYearNames = [];

    let currentDate = startDates;

    while (currentDate <= endDates) {
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        monthYearNames.push(`${monthName} ${year}`);
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return monthYearNames;
}
/** */
module.exports.fetchStartedEndMonthDate = (month, year) => {
    const labelYear = year; // Replace with the desired year
    const labelMonth = month; // Note that months are 0-indexed in JavaScript (0 = January, 8 = September)
    const monthIndex = new Date(Date.parse(labelMonth + " 1, 2000")).getMonth();
    // Create a Date object for the first day of October 2023
    const firstDay = new Date(labelYear, monthIndex, 1); // Note: Months are zero-based, so October is represented by 9

    // Create a Date object for the last day of October 2023
    const lastDay = new Date(labelYear, monthIndex + 1, 0); // The 0th day of a month goes back to the last day of the previous month

    // Format the dates in "YYYY-MM-DD" format
    const firstDayFormatted = formatDate(firstDay);
    const lastDayFormatted = formatDate(lastDay);

    // Function to format a date as "YYYY-MM-DD"
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    return { 'startDate': firstDayFormatted, 'endDate': lastDayFormatted };
}
/** get sorting for  user activity logs*/
module.exports.getSortedUserActivity = (sort) => {
    if (sort.sortById) {
        if (sort.sortById == "DESC") return ['id', 'DESC'];
        return ['id', 'ASC']
    }
    if (sort.sortByName) {
        if (sort.sortByName == "DESC") return ['activityName', 'DESC'];
        return ['activityName', 'ASC'];
    }
    if (sort.sortByType) {
        if (sort.sortByType == "DESC") return ['activityType', 'DESC'];
        return ['activityType', 'ASC'];
    }
    if (sort.sortByDiscription) {
        if (sort.sortByDiscription == "DESC") return ['description', 'DESC'];
        return ['description', 'ASC'];
    }
    if (sort.sortByuserEmail) {
        if (sort.sortByuserEmail == "DESC") return ['takenBy', 'DESC'];
        return ['takenBy', 'ASC'];
    }
    if (sort.sortByUserRole) {
        if (sort.sortByUserRole == "DESC") return ['takenByRole', 'DESC'];
        return ['takenByRole', 'ASC'];
    }
    if (sort.sortByError) {
        if (sort.sortByError == "DESC") return ['error', 'DESC'];
        return ['error', 'ASC'];
    }
    return ['id', 'DESC'];
}