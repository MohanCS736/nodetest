require("dotenv").config();
const favoriteDocumentsModel = require("../models/favouriteDocuments");
const favoriteDocumentsFolderModel = require("../models/favouriteDocumentsFolder");
const documentsInFavouriteFolderModel = require("../models/documentInFavouriteFolder");
const resourcesModel = require("../models/resources");
const trainingTypeModel = require("../models/trainingType");
const helper = require("../helpers/helper");
const reportManagement = require("../helpers/reports");
const { Op, Sequelize } = require("sequelize");
const { addUserActivity,  activityTypes ,activity } = require("../helpers/logs");
const subjectsModel = require("../models/subjects");

class addToFavorite {
  /** add and remove the documents from favourite  */
  async addAndRemove(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Add and remove from favorites";

    try {
      /**activity type */
      activity.type = activityTypes.INFO;
      /**get data from request body */
      const data = req.body;
      const user = req.user;
      data.userId = user.userId;
      /** check the documents exists in favourite */
      const existsIds = {};
      existsIds.userId = user.userId;
      existsIds.documentId = data.documentId;

      // Grab document information
      const documentInfo = await resourcesModel.findOne({
        where: data.documentId,
        attributes: [
          "documentName",
          "documentDescription",
          "language",
          "trainingType",
          "resourceName",
          "resourceDescription",
          "fileName",
          "filePath",
        ],
        raw: true,
      });
      const documentExists = await favoriteDocumentsModel.findOne({
        where: existsIds,
      });
      /**if exists then remove the documents from favourite */
      if (documentExists) {
        const removeFromFavorite = await favoriteDocumentsModel.destroy({
          where: existsIds,
        });
        /**return the results */
        return res.send({ message: "Document remove from favorites" });
      }
      /**add to favourite */
      const addToFavorite = await favoriteDocumentsModel.create(data);

      await reportManagement.documentReport(
        documentInfo,
        user.userId,
        "favourite"
      );

      /** collection/folder is exists then add that document to that folder */
      if (data.folders) {
        const folderData = [];
        data.folders.map((d) => {
          folderData.push({ folderId: d, favouriteId: addToFavorite.id });
        });
        const addToFolder = await documentsInFavouriteFolderModel.bulkCreate(
          folderData
        );
      }
      res.send({ message: "Document added to favorites" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while add and remove the document from favourite, Error: ${e} `;
      addUserActivity(activity);
      console.log(e);
      return res.status(500).send({
        message: "error occur while processing the request",
        error: e,
      });
    }
  }
  /**get favourite document list  */
  async getFavoriteDocument(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get favourite documents";
    try {
      /**get logged in user details */
      const user = req.user;
      const qString = req.query;
      const data =req.body.data;
      /**breaking the where  */
      const where = {};
      const whereAnd = [];
  
      whereAnd.push({ userId: user.userId });
      if (data?.language?.length > 0)whereAnd.push({ "$resource.language$": { [Op.in]: data.language } });
      if (data?.trainingName?.length > 0) whereAnd.push({ "$resource.training_type.id$": { [Op.in]: data.trainingName } });
      if (data?.subject?.length > 0) whereAnd.push({ "$resource.subjects.id$": { [Op.in]: data.subject } });
      where[Op.and] = whereAnd;
      const resourcesWhere = {};
      const resourceAnd = [];
      /**if level is exists  */
      if (qString.level) {
        if (qString.level != "all") {
          resourceAnd.push({ level: qString.level });
        }
      }

      resourcesWhere[Op.and] = resourceAnd;
      /**breaking the include  */
      const include = [];
      include.push({
        model: resourcesModel,
        where: resourcesWhere,
        include: [{ model: trainingTypeModel,attributes:['id','trainingName'] },
                  {model:subjectsModel,attributes:['id']}
                ],
      });
      /**only include this if collection is avialable */
      if (qString.collection) {
        if (qString.collection != "all") {
          include.push({
            model: documentsInFavouriteFolderModel,
            attribute: [],
            where: { folderId: qString.collection },
          });
        }
      }

      let favoriteDocuments = await favoriteDocumentsModel.findAll({
        where: where,
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(CASE WHEN (favourite_documents.documentId= resource.id AND favourite_documents.userId=${user.userId}) THEN 1 ELSE 0 END)`
              ),
              "addedToFavourites",
            ],
          ],
        },
        include: include,
      });
      res.send({ favorites: favoriteDocuments });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the list of favourite documents`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.status(500).send({
        message: "error occur while processing the request",
        error: e,
      });
    }
  }
  /**creating the favourite folder/collection */
  async createFavouriteFolder(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Creating favourite folder";
    try {
      const data = req.body;
      const user = req.user;
      data.userId = user.userId;
      const folderExists = await favoriteDocumentsFolderModel.findOne({
        where: data,
      });
      if (folderExists) {
        return res
          .status(210)
          .send({ message: "Folder With Given Name Already Exists" });
      }
      const createFolder = await favoriteDocumentsFolderModel.create(data);
      res.send({ message: "Collection Created" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while creating the new favourite folder, Error ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.status(500).send({
        message: "error occur while processing the request",
        error: e,
      });
    }
  }
  /** get favourite folder/collection */
  async getFavoriteDocumentsFolders(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get favourite folder/collection";
    try {
      const user = req.user;
      let folder = await favoriteDocumentsFolderModel.findAll({
        where: {
          userId: user.userId,
        },
      });
      res.send({ favoritesFolder: folder });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user get his favourite folder/collection`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.status(500).send({
        message: "error occur while processing the request",
        error: e,
      });
    }
  }
}

module.exports = addToFavorite;
