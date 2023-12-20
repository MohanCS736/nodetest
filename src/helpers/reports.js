const DocumentReportLog = require("../models/documentReportLogs");
const DocumentReportActivities = require("../models/documentReportActivities");
const userModal = require("../models/users");
const trainTypeModal = require("../models/trainingType");

module.exports.documentReport = async (document, user, activityType) => {
  if (document.trainingType) {
    const trainingTypeInfo = await trainTypeModal.findOne({
      where: { id: document.trainingType },
      attribute: ["trainingName"],
    });
    // console.log(trainingTypeInfo);
    document.trainingType = trainingTypeInfo.trainingName;
  }
  const userData = await userModal.findOne({
    where: user,
    attributes: [
      ["id", "userId"],
      ["username", "userName"],
      ["email", "userEmail"],
      "address",
      ["company", "companyName"],
      ["phone", "phoneNumber"],
    ],
    raw: true,
  });
  // Manage entries on the resource bases
  const documentWhere = {
    type: 2,
    documentName: document.documentName,
    language: document.language,
    trainingType: document.trainingType,
    resourceName: document.resourceName,
  };

  const documentParentRow = await this.updateOrCreate(
    DocumentReportLog,
    document,
    documentWhere,
    activityType
  );

  userData.type = 3;
  userData.documentReportId = documentParentRow.id;
  userData.activityType = this.findLogType(activityType);

  // Capture the activity who took this action
  const documentUserActivityRow = DocumentReportActivities.create(userData);

  delete userData["documentReportId"];
  delete userData["activityType"];
  delete userData["type"];

  // Manage entries on the user bases
  const userWhere = {
    type: 2,
    userName: userData.userName,
    userEmail: userData.userEmail,
    phoneNumber: userData.phoneNumber,
    address: userData.address,
    companyName: userData.companyName,
  };

  const userParentRow = await this.updateOrCreate(
    DocumentReportActivities,
    userData,
    userWhere,
    activityType
  );

  document.type = 3;
  document.documentReportActivityId = userParentRow.id;
  document.activityType = this.findLogType(activityType);

  // Capture the document who took this action
  const userDocumentActivityRow = DocumentReportLog.create(document);
  return "successfull";
};

module.exports.updateOrCreate = async (
  model,
  values,
  condition,
  activityType
) => {
  // console.log(values);

  // Try to find a record that matches the condition
  const existingRecord = await model.findOne({ where: condition });

  // If the record exists, update it with the new values
  if (existingRecord) {
    // Verify the request model is DocumentReportLog or DocumentReportActivities
    if (model === DocumentReportLog || model === DocumentReportActivities) {
      switch (activityType.toLowerCase()) {
        case "favourite":
          values.favourites = existingRecord.favourites + 1;
          break;

        case "download":
          values.downloads = existingRecord.downloads + 1;
          break;

        case "view":
          values.views = existingRecord.views + 1;
          break;

        default:
          // Invalid request type
          break;
      }
    }
    /**if watchedTime exists */
    if (values.watchedTime) {
      /**then compare the existing and new watch time */
      const newTime = new Date(`$2021-03-25 ${values.watchedTime}`);
      const existTime = new Date(
        `2021-03-25 ${existingRecord.averageWatchedTime}`
      );
      /**set the watch time */
      values.averageWatchedTime =
        newTime.getTime() > existTime.getTime()
          ? values.watchedTime
          : existingRecord.averageWatchedTime;
    }
    existingRecord.update(values);
    return existingRecord;
  }

  // Insert a new record if it doesn't exist
  if (model === DocumentReportLog || model === DocumentReportActivities) {
    values.type = 2;
    values.favourites = activityType == "favourite" ? 1 : 0;
    values.downloads = activityType == "download" ? 1 : 0;
    values.views = activityType == "view" ? 1 : 0;
    values.finish = 0;
    values.averageWatchedTime = values.watchedTime ? values.watchedTime : "0";
  }

  // If the record doesn't exist, create a new one with the provided values
  const newRecord = model.create(values);

  return newRecord;
};

module.exports.findLogType = (type) => {
  switch (type.toLowerCase()) {
    case "favourite":
      return 22;

    case "download":
      return 23;

    case "view":
      return 24;

    default:
      // Invalid request type
      return "Invalid request type.";
  }
};
