require("dotenv").config();
const AdmZip = require("adm-zip");
const fs = require("fs");
const modelsDocumentPermission = require("../models/modelDocumentPermissions");
const usersModel = require("../models/users");
const resourcesModel = require("../models/resources");
const subjectsModel = require("../models/subjects");
const resourcesHaveSubjects = require("../models/resourcesHaveSubjects");
const resourceHaveSubjectsModel = require("../models/resourcesHaveSubjects");
const trainingTypeModel = require("../models/trainingType");
const helper = require("../helpers/helper");
const subjects = require("../models/subjects");
const path = require("path");
const reportManagement = require("../helpers/reports");
const cartModel = require("../models/cart");
const { Op, Sequelize, where } = require("sequelize");
const mailSubject = require("../config/subject_" +
  process.env.APP_ENV +
  "_config.json");
const documentReportLog = require("../models/documentReportLogs");
const documentReportActivities = require("../models/documentReportActivities");
const DownloadedDocumentsModal = require("../models/usersDownloadedDocuments");
const documentLevel = require("../models/documentLevels");
const Mail = require("../classes/sendMail");
const moment = require("moment");
const trainingType = require("../models/trainingType");
const managerHavePermissions = require("../models/managerHavePermissions");
const favouriteDocumentsModel = require("../models/favouriteDocuments");
const favoriteDocumentsModel = require("../models/favouriteDocuments");
const userDownloadedDocumentsModel = require("../models/usersDownloadedDocuments");
const userWatchedDocumentsModel = require("../models/userWatchedDocuments");
const { addUserActivity } = require("../helpers/logs");
const { activityTypes } = require("../helpers/logs");
const { activity } = require("../helpers/logs");
const { checkResourceIsExpired, secondsToHMS } = require("../helpers/resource");
class resources {
  async add(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Add new resource";
    try {
      const data = req.body;
      data.addedByUser = req.user.userId;
      data.fileName = req?.file?.originalname;
      data.filePath = process.env.SITE_URL + process.env.RESOURCES_FILE_PATH;
      if (req.user.role == "4") {
        data.status = "pending";
      }
      const addResources = await resourcesModel.create(data);
      const data2 = {};
      data2.resourceId = addResources.id;
      if (typeof data.subjectId == "object") {
        data.subjectId.map(async (id) => {
          data2.subjectId = id;
          const addSubjects = await resourceHaveSubjectsModel.create(data2);
        });
      } else {
        data2.subjectId = data.subjectId;
        const addSubjects = await resourceHaveSubjectsModel.create(data2);
      }
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User Added the new resource, resource name: ${data.name}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "Document Is Added" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user creating new resource, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async fetchRequests(req, res) {
    try {
      // Declaring variable/arrays
      const user = req.user;
      const where = {};
      const whereOr = [];
      const whereAnd = [];

      // Fetching the query string value
      const qString = req.query;

      if (qString.page) {
        if (qString.page < 0 || isNaN(qString.page)) {
          return res.status(400).json({
            error: "Page in query string must be a non-negative number.",
          });
        }
      }
      if (qString.size) {
        if (qString.size <= 0 || isNaN(qString.size)) {
          return res
            .status(400)
            .json({ error: "Size in query string must be a positive number." });
        }
      }
      // Get sorting criteria
      const sort = helper.getSortedResource(qString);
      // Search filters
      if (qString.search) {
        whereOr.push({ documentName: { [Op.like]: `%${qString.search}%` } });
        whereOr.push({ level: { [Op.like]: `%${qString.search}%` } });
        whereOr.push({ language: { [Op.like]: `%${qString.search}%` } });
        whereOr.push({ status: { [Op.like]: `%${qString.search}%` } });
        whereOr.push({
          "$addedBy.username$": { [Op.like]: `%${qString.search}%` },
        });
        where[Op.or] = whereOr;
      }

      const { limit, offset } = helper.getPagination(
        qString.page,
        qString.size
      );

      whereAnd.push({ status: "pending" });

      // If contributor id is set then sort the requests
      if (req.params.contributorId) {
        const id = req.params.contributorId;
        whereAnd.push({ addedByUser: id });
      }
      /**if manager access the document request list then show only his assign content contributor request */
      if (user.role == 3) {
        const manager = await usersModel.findOne({
          where: {
            id: user.userId,
          },
          include: {
            model: usersModel,
            as: "assignUser",
            attributes: ["id"],
          },
        });
        if (manager?.assignUser?.length > 0) {
          const managerContentContributorIds = manager?.assignUser.map(
            (c) => c.id
          );
          whereAnd.push({
            addedByUser: { [Op.in]: managerContentContributorIds },
          });
        }
      }
      where[Op.and] = whereAnd;
      let resources = await resourcesModel.findAll({
        order: [sort],
        where: where,
        include: [
          {
            model: usersModel,
            as: "addedBy",
          },
          {
            model: trainingTypeModel,
          },
        ],
        // limit: limit,
        // offset: offset,
      });
      // resources = { count: totalResources, rows: resources };
      // resources = helper.getPaginationData(resources, qString.page, limit);

      return res.send(resources);
    } catch (error) {
      console.error("Error checking resource requests:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Accept/Reject document requests
  async acceptRejectDocumentRequests(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Document Request";
    const data = req.body;
    try {
      const resourceRequests = {};
      var formattedSubject = "-";
      resourceRequests.actionTakenBy = data.id;
      const mail = new Mail();

      const requestDetail = await resourcesModel.findOne({
        where: {
          id: data.id,
        },
        include: [{ model: subjectsModel }, { model: trainingTypeModel }],
      });
      if (requestDetail.subjects && requestDetail.subjects.length > 0) {
        var subject = [];
        requestDetail.subjects.forEach((element) => {
          subject.push(element.name);
        });

        formattedSubject = subject.join(",");
      }

      const contributorInfo = await usersModel.findOne({
        where: {
          id: requestDetail.addedByUser,
        },
      });

      switch (data.action) {
        case "Declined":
          resourceRequests.status = "declined";
          resourceRequests.declineReason = data.reason;
          const rejectTemplate =
            "<table width='600' cellpadding='0' cellspacing='0' border='0' align='center'><tr><td><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr style='background-color:#f4f4f4;'><td style='padding:20px 15px;text-align:center;'><a href=''><img src='https://klgreact.csdevhub.com/assets/logo.png' width='150' height='44' alt=''></a></td></tr><tr><td style='padding: 35px 15px;'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='font-size:22px;font-family:Arial, sans-serif;font-weight:bold;padding:0 0 20px 0'>Greetings,</td></tr><tr><td style='font-size:15px;font-family:Arial, sans-serif;line-height:20px;'>This email is to inform you that your request for access to the document resource '" +
            requestDetail.resourceName +
            "' within the KLG application has been declined.</td></tr><tr><td style='font-size:15px;font-family:Arial, sans-serif;font-weight:bold;padding:10px 0 10px 0'>Reason for Declination:</td></tr><tr><td style='font-size:15px;font-family:Arial, sans-serif;line-height:20px;'>" +
            data.reason +
            "</td></tr> <tr><td style='font-size:15px;font-family:Arial, sans-serif;font-weight:bold;padding:10px 0 10px 0'>Next Steps:</td></tr><tr><td style='font-size:15px;font-family:Arial, sans-serif;line-height:20px;'> <ul> <li><span style='font-weight:bold;'>Review your request:</span> Please carefully review your request and ensure all necessary information is included.</li> <li><span style='font-weight:bold;'>Provide additional information:</span> If you believe any necessary information is missing from your request, please reply to this email and provide the missing details.</li> <li><span style='font-weight:bold;'>Contact support:</span> If you have any questions or require further assistance, please contact our support team at [Support Contact Information].</li> </ul></td></tr> <tr><td style='font-size:15px;font-family:Arial, sans-serif;line-height:20px;padding:25px 0 15px 0'>This email comes from an unmonitored box. Do not reply to this email.</td></tr></table></td></tr><tr style='background-color:#f4f4f4'><td style='padding:10px 15px;'><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='font-size:15px;font-family:Arial, sans-serif;line-height:20px;font-weight:bold;text-align:center;padding:0 0 5px 0'>Thanks</td></tr> <tr><td style='font-size:15px;font-family:Arial, sans-serif;line-height:20px;text-align:center;'>KLG Team</td></tr></table></td></tr></table></td></tr></table>";
          await mail.generateMail(
            contributorInfo.email,
            mailSubject.DECLINE_DOCUMENT_ACCOUNT_REQUEST,
            rejectTemplate
          );
          break; // Add this break statement

        case "Accepted":
          resourceRequests.status = "active";
          const acceptedTemplate =
            `<table width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="background-color:#f4f4f4;"><td style="padding:20px 15px;text-align:center;"><a href=""><img src="https://klgreact.csdevhub.com/assets/logo.png" width="150" height="44" alt=""></a></td></tr><tr><td style="padding: 35px 15px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size:22px;font-family:Arial, sans-serif;font-weight:bold;padding:0 0 20px 0">Dear Contributor,</td></tr><tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;padding-bottom:20px;">This email is to inform you that your request for access to the document resource "` +
            requestDetail.resourceName +
            `" has been approved! 🎉</td></tr> <tr> <td><table border="1" style="border-collapse:collapse;"> <tr><th style="background-color:#000;color:#fff;padding:10px;font-size:14px;font-family:Arial, sans-serif;">Resource</th><th style="background-color:#000;color:#fff;padding:10px;font-size:14px;font-family:Arial, sans-serif;">Document</th><th style="background-color:#000;color:#fff;padding:10px;font-size:14px;font-family:Arial, sans-serif;">Subject</th><th style="background-color:#000;color:#fff;padding:10px;font-size:14px;font-family:Arial, sans-serif;">Training Type</th><th style="background-color:#000;color:#fff;padding:10px;font-size:14px;font-family:Arial, sans-serif;">Language</th><th style="background-color:#000;color:#fff;padding:10px;font-size:14px;font-family:Arial, sans-serif;">Access Level</th> </tr> <tr><td style="font-size:14px;font-family:Arial, sans-serif;padding:10px;">` +
            requestDetail.resourceName +
            `</td><td style="font-size:14px;font-family:Arial, sans-serif;padding:10px;">` +
            requestDetail.documentName +
            `</td><td style="font-size:14px;font-family:Arial, sans-serif;padding:10px;">` +
            formattedSubject +
            `</td><td style="font-size:14px;font-family:Arial, sans-serif;padding:10px;">` +
            requestDetail.training_type.trainingName +
            `</td><td style="font-size:14px;font-family:Arial, sans-serif;padding:10px;">` +
            requestDetail.language +
            `</td><td style="font-size:14px;font-family:Arial, sans-serif;padding:10px;">Level ` +
            requestDetail.level +
            `</td> </tr></table> </td></tr> <tr><td style="font-size:15px;font-family:Arial, sans-serif;font-weight:bold;padding:20px 0 10px 0">Access Instructions:</td></tr><tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;"><ul> <li>You can access the document directly within the klg application.</li> <li>[If applicable, include a screenshot or visual guide to help the user locate the document.]</li> <li><a href="https://klgreact.csdevhub.com/content-contributor/resources-management">View the Document.</a></li> </ul></td></tr> <tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;padding:25px 0 15px 0">This email comes from an unmonitored box. Do not reply to this email.</td></tr></table></td></tr><tr style="background-color:#f4f4f4"><td style="padding:10px 15px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;font-weight:bold;text-align:center;padding:0 0 5px 0">Thanks</td></tr> <tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;text-align:center;">KLG Team</td></tr></table></td></tr></table></td></tr></table>`;
          await mail.generateMail(
            contributorInfo.email,
            mailSubject.ACCEPTED_DOCUMENT_ACCOUNT_REQUEST,
            acceptedTemplate
          );
          break; // Add this break statement

        default:
          return res.status(210).send({
            message: "In Action Only Accept And Decline Parameter Allowed",
          });
      }
      await requestDetail.update(resourceRequests, { where: { id: data.id } });
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User ${data.action} the resources, resource id: ${data.id}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({
        message: `Countributor Document Request is Sucessfully ${data.action}`,
      });
    } catch (e) {
      console.log(e);
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user ${data.action} the resources, resource id: ${data.id}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      res.status(250).send({
        message: "error occur while processing the request",
        error: e,
      });
    }
  }

  async getAll(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get all resources";
    try {
      const qString = req.query;
      const user = req.user;

      // Initialize query parameters with default values if they are missing
      const { documentName, subject, resourceName, level } = qString;

      // Validate and handle pagination parameters
      if (qString.page && (isNaN(qString.page) || qString.page < 0)) {
        return res.status(400).json({ error: "Invalid 'page' parameter" });
      }
      if (qString.size && (isNaN(qString.size) || qString.size <= 0)) {
        return res.status(400).json({ error: "Invalid 'size' parameter" });
      }

      // Get pagination settings

      // Get sorting criteria
      const sort = helper.getSortedResource(qString);

      // Define associations to include in the query
      const include = [
        { model: subjects, require: true },
        { model: trainingType, require: true },
      ];

      // Initialize where clause
      // let where = {
      //   [Op.or]: [
      //     { documentName: { [Op.like]: `%${documentName}%` } },
      //     { resourceName: { [Op.like]: `%${resourceName}%` } },
      //     { level: { [Op.like]: `%${level}%` } },
      //     { '$subjects.name$': { [Op.like]: `%${qString.subjects}%` } },
      //     {"$training_type.trainingName$":{[Op.like]:`%${qString.trainingName}%`}}
      //   ],
      // };
      const where = {};
      const whereOr = [];
      const whereAnd = [];
      if (qString.trainingName)
        whereOr.push({
          "$training_type.trainingName$": {
            [Op.like]: `%${qString.trainingName}%`,
          },
        });
      if (qString.subjects)
        whereOr.push({
          "$subjects.name$": { [Op.like]: `%${qString.subjects}%` },
        });
      if (qString.documentName)
        whereOr.push({ documentName: { [Op.like]: `%${documentName}%` } });
      if (qString.resourceName)
        whereOr.push({ resourceName: { [Op.like]: `%${resourceName}%` } });
      if (qString.language)
        whereOr.push({ language: { [Op.like]: `%${qString.language}%` } });
      if (qString.level) whereOr.push({ level: { [Op.like]: `%${level}%` } });
      if (qString.level) whereOr.push({ status: { [Op.like]: `%${level}%` } });
      if (whereOr.length > 0) where[Op.or] = whereOr;
      // For user role 3
      switch (user.role) {
        case 3 /** */:
          const permission = await usersModel.findOne({
            where: { id: user.userId },
            include: [{ model: managerHavePermissions }],
          });
          if (permission?.manager_Have_Permission?.permissionId === 2) {
            // Content contributor logic
            const contentContributor = await usersModel.findAll({
              attributes: ["id"],
              include: [
                {
                  model: usersModel,
                  where: { id: user.userId },
                  as: "manager",
                },
              ],
            });
            const contentContributorIds = contentContributor.map((c) => c.id);
            contentContributorIds.push(user.userId);
            where.addedByUser = { [Op.in]: contentContributorIds };
          }
          break;
        case 4:
          whereAnd.push({ addedByUser: user.userId });
          where[Op.and] = whereAnd;
          break;
      }
      // Query the resources with filters and pagination
      const totalResources = await resourcesModel.count({ where, include });
      const resources = await resourcesModel.findAll({
        order: [sort],
        where,
        include,
        // limit,
        // offset,
      });

      // Check if a resource is expired
      async function isResourceExpired(resource) {
        const createdDate = moment(resource.activatedAt);
        const currentDate = moment();
        const monthsDifference = currentDate.diff(createdDate, "months");
        return monthsDifference >= 12;
      }

      // Add 'isExpired' property to each resource object
      const resourcesWithExpiration = await Promise.all(
        resources.map(async (resource) => {
          const isExpired = await isResourceExpired(resource);
          return { ...resource.toJSON(), isExpired };
        })
      );
      const response = resourcesWithExpiration;
      return res.status(200).json(response);
    } catch (error) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting list of all resources, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.error("Error occurred while processing the request:", error);
      return res.status(500).json({
        message: "Error occurred while processing the request",
        error: error.message,
      });
    }
  }

  async getparticularUserResources(req, res) {
    try {
      /**sending req */
      activity.req = req;
      /** activity name */
      activity.name = "Get all resources";
      const qString = req.query;
      const id = req.user.userId;
      qString.documentName = qString.documentName ? qString.documentName : "";
      qString.subject = qString.subject ? qString.subject : "";
      qString.resourceName = qString.resourceName ? qString.resourceName : "";
      qString.level = qString.level ? qString.level : "";
      const view = helper.getEnabledDisabled(qString);
      const where = {};
      const whereOr = [];
      const whereAnd = [];
      if (qString.trainingName)
        whereOr.push({
          "$training_type.trainingName$": {
            [Op.like]: `%${qString.trainingName}%`,
          },
        });
      if (qString.subjects)
        whereOr.push({
          "$subjects.name$": { [Op.like]: `%${qString.subjects}%` },
        });
      if (qString.documentName)
        whereOr.push({ documentName: { [Op.like]: `%${documentName}%` } });
      if (qString.resourceName)
        whereOr.push({ resourceName: { [Op.like]: `%${resourceName}%` } });
      if (qString.language)
        whereOr.push({ language: { [Op.like]: `%${qString.language}%` } });
      if (qString.level)
        whereOr.push({ level: { [Op.like]: `%${qString.level}%` } });
      if (whereOr.length > 0) where[Op.or] = whereOr;
      whereAnd.push(view);
      whereAnd.push({ addedByUser: id });
      where[Op.and] = whereAnd;
      /**get sorting */
      const sort = helper.getSortedResource(qString);
      let resources = await resourcesModel.findAll({
        order: [sort],
        where: where,
        include: [{ model: subjects }, { model: trainingType }],
        // limit: limit,
        // offset: offset,
      });

      // Function to check if a resource is expired
      async function isResourceExpired(resource) {
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
      }

      // Add a new property 'isExpired' to each resource object
      const resourcesWithExpiration = await Promise.all(
        resources.map(async (resource) => {
          const isExpired = await isResourceExpired(resource);
          return { ...resource.toJSON(), isExpired }; // Include 'isExpired' in the response
        })
      );

      // const response = helper.getPaginationData(
      //   { count: totalResources, rows: resourcesWithExpiration },
      //   qString.page,
      //   limit
      // );
      const response = resourcesWithExpiration;
      // console.log(response);
      // resources = helper.getPaginationData(response, qString.page, limit);
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User Get all the resources`;
      /**add user activity */
      addUserActivity(activity);
      return res.send(response);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting list of all resources, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.send({
        message: "error occurred while processing the request",
        error: e,
      });
    }
  }

  //    To delete the resource
  async delete(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Deleting resource";
    const resourceId = req.params.id;
    try {
      const courses = await resourcesModel.destroy({
        where: {
          id: resourceId,
        },
      });
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User deleted the resources , resource id: ${resourceId}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "Resource Deleted Successfully" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user deleting the resources , resource id: ${resourceId}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      res
        .status(500)
        .send({ message: "error occure while processing", error: e });
    }
  }

  /* get single resource */
  async getOne(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get single resource details";
    try {
      const resourceId = req.params.id;
      const user = req.user;
      const singleResource = await resourcesModel.findOne({
        where: {
          id: resourceId,
        },
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(CASE WHEN (favourite_documents.documentId= resources.id AND favourite_documents.userId=${user.userId}) THEN 1 ELSE 0 END)`
              ),
              "addedToFavourites",
            ],
          ],
        },
        include: [
          { model: subjectsModel },
          { model: trainingTypeModel },
          { model: favouriteDocumentsModel, attributes: [] },
        ],
      });

      singleResource.filePath = `${process.env.SITE_URL}${process.env.RESOURCES_FILE_PATH}/${singleResource.fileName}`;
      singleResource.filePath = `https://klgnode.csdevhub.com/images/documents/2023-11-5-1701786239721-ScreenRecording2023-11-29at5.18.02pm.mov`;
      res.send(singleResource);
    } catch (e) {
      console.log(e);
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the single resource details, resourceId: ${req?.params?.id}`;
      /**add user activity */
      addUserActivity(activity);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  /** enable disable the courses */
  async enableDisableResource(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Updating the resource status";
    const resourceId = req.params.id;
    const data = req.body;
    try {
      const enableDisble = await resourcesModel.update(data, {
        where: {
          id: resourceId,
        },
      });
      const status = data.view ? "enable" : "disable";
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User updated the resource status to ${status}, resource id: ${resourceId}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "Resource Status is Updated" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user updating the resource status, resource id: ${req.params.id}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async bulkOperation(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Resource bulk operation";
    try {
      const data = req.body;
      let action;
      if (data.action == "Delete")
        action = await resourcesModel.destroy({
          where: { id: { [Op.in]: data.id } },
        });
      if (data.action == "Enable")
        action = await resourcesModel.update(
          { view: true },
          { where: { id: { [Op.in]: data.id } } }
        );
      if (data.action == "Disable")
        action = await resourcesModel.update(
          { view: false },
          { where: { id: { [Op.in]: data.id } } }
        );
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User ${data.action}d the resources, resource ids: ${data.id}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: `Selected Resources Are ${data.action}d` });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user performing the bulk operation in resources,action: ${req.body.action} resource ids ${req.body.id}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  /* update the resource */
  async update(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Updating resource details";
    const data = req.body;
    const resourceId = req.params.id;
    const documentFile = req.file;
    // return  res.send({ message: "Resource and associated subjects updated successfully" });
    try {
      const documentNameExists = await resourcesModel.findAll({
        where: {
          documentName: data.documentName,
          id: resourceId,
        },
      });

      if (documentNameExists.length === 0) {
        const documentNameExistsGlobal = await resourcesModel.findOne({
          where: {
            documentName: data.documentName,
          },
        });
        if (documentNameExistsGlobal) {
          return res
            .status(210)
            .send({ message: "Document Is Exists With Given Name" });
        }
      }
      /**if file exists */
      if (documentFile) {
        data.fileName = documentFile.originalname;
        data.filePath = process.env.SITE_URL + process.env.RESOURCES_FILE_PATH;
      }
      /** */
      const requestDetail = await resourcesModel.findOne({
        where: {
          id: resourceId,
        },
      });
      /** */
      if (requestDetail.status == "declined") {
        data.status = "pending";
      }
      // Update the resource's information
      const updatedResource = await resourcesModel.update(data, {
        where: {
          id: resourceId,
        },
      });

      // Check if subjects data is present in the request
      // Check if subjects data is present in the request
      if (data.subjects) {
        // Change this line to check for data.subjectId
        // Delete existing associations between the resource and subjects
        await resourcesHaveSubjects.destroy({
          where: {
            resourceId,
          },
        });

        // Add associations with the new subjects
        const subjectIds = data.subjects; // Access subject IDs as data.subjectId
        let associations;
        if (typeof subjectIds === "string") {
          associations = [{ resourceId: resourceId, subjectId: subjectIds }];
        } else {
          associations = subjectIds.map((subjectId) => ({
            resourceId: resourceId,
            subjectId: subjectId.id ? subjectId.id : subjectId, // Use subjectId directly
          }));
        }

        // Now the associations array should not be empty
        await resourcesHaveSubjects.bulkCreate(associations);
      }

      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User updated the details of the resources, resource id: ${resourceId}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({
        message: "Resource and associated subjects updated successfully",
      });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user updated the details of the resources, resource id: ${req.params.id}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(500)
        .send({ message: "Error occurred while processing", error: e });
    }
  }

  async resourceStatusUpdate(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Updating resource status";
    const data = req.body;
    data.activatedAt = new Date();

    switch (data.status) {
      case "Activate":
        await resourcesModel.update(data, { where: { id: data.id } });
        break;
      case "Deactivate":
        await resourcesModel.update(data, { where: { id: data.id } });
        break;
      default:
        return res.status(210).send({
          message:
            "only Activate and Deactivate Parameter Allowed In status Field",
        });
    }
    res.send({ message: "Status Is Updated" });
  }
  async subjectsResources(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    if (req.params.subjectId) {
      activity.name = "Get resources by subject id";
    } else if (req.params.trainingTypeId) {
      activity.name = "Get resources by training type id";
    }
    try {
      const user = req.user;
      let subjectId, trainingTypeId;
      if (req.params.subjectId) subjectId = req.params.subjectId;
      if (req.params.trainingTypeId) trainingTypeId = req.params.trainingTypeId;
      /**get data from query string */
      const qString = req.query;
      /**break down the where */
      const where = {};
      where.view = true;
      if (qString.language) where.language = qString.language;
      const include = [];
      /**break down of include */
      if (subjectId)
        include.push(
          {
            model: subjects,
            where: { id: subjectId },
            attributes: ["id", "name"],
          },
          { model: trainingTypeModel, attributes: ["id", "trainingName"] }
        );
      include.push({ model: favoriteDocumentsModel, include: [] });
      if (trainingTypeId)
        include.push({
          model: trainingTypeModel,
          where: { id: trainingTypeId },
          attributes: ["id", "trainingName"],
        });
      /**executing query */
      const documents = await resourcesModel.findAll({
        where: where,
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(CASE WHEN (favourite_documents.documentId= resources.id AND favourite_documents.userId=${user.userId}) THEN 1 ELSE 0 END)`
              ),
              "addedToFavourites",
            ],
          ],
        },
        include: include,
      });
      const data = {};
      data.documents = documents;

      if (trainingTypeId) {
        data.trainingType = await trainingTypeModel.findOne({
          where: { id: trainingTypeId },
        });
        /**add activity description */
      }
      if (subjectId) {
        data.subject = await subjects.findOne({ where: { id: subjectId } });
        /**add activity description */
      }
      // Add 'isExpired' property to each resource object
      const resourcesWithExpiration = await Promise.all(
        data.documents.map(async (resource) => {
          const isExpired = await checkResourceIsExpired(resource);
          return { ...resource.toJSON(), isExpired };
        })
      );
      data.documents = resourcesWithExpiration;
      res.send(data);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the resources`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }
  async addResourcesToCart(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Add to cart";

    try {
      const data = req.body;
      data.userId = req.user.userId;

      /**get document details */
      const document = await resourcesModel.findOne({
        where: { id: data.resourceId },
      });
      /**check the level of document  */
      if (document.level == 2) {
        /**checking user permissions */
        const permission = await modelsDocumentPermission.findOne({
          where: { userId: data.userId },
        });
        if (permission.level != 2)
          return res
            .status(240)
            .send({ message: "Level 2 Permission Required" });
      }
      const documentExists = await cartModel.findOne({
        where: { resourceId: data.resourceId, userId: data.userId },
      });
      if (documentExists)
        return res
          .status(210)
          .send({ message: "You Already Added Given Document To Cart" });
      const addCart = await cartModel.create(data);
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User added the document to cart`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "Document Added To Cart" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user adding the document to cart, Error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }
  async getCart(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "my cart";
    try {
      const data = req.body;
      data.userId = req.user.userId;
      const user = req.user;
      const qString = req.query;
      if (qString.page) {
        if (qString.page < 0 || !qString.page.match("^[0-9]*$"))
          return res.send({
            error: "page in query string can't be negative  and string",
          });
      }
      if (qString.size) {
        if (qString.size <= 0 || !qString.size.match("^[0-9]*$"))
          return res.send({
            error: "size in query string must be greater than 0  and string",
          });
      }
      const cart = await cartModel.findAll({
        include: [
          { model: usersModel },
          {
            model: resourcesModel,
            include: [
              { model: favoriteDocumentsModel },
              { model: subjectsModel },
            ],
          },
        ],
        where: { userId: req.user.userId },
      });
      cart.map((c, i) => {
        // console.log(c.resource.favourite_documents)
        if (c.resource.favourite_documents.length > 0) {
          const haveFav = c.resource.favourite_documents.filter(
            (f) => f.documentId == c.resource.id && f.userId == user.userId
          );
          if (haveFav.length > 0) {
            cart[i].resource.inFavourites = 1;
          }
        }
      });
      res.send({ rows: cart });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user gettin the resources from his cart`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }
  // To delete the cart products
  async removeFromCart(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Remove from cart";
    const cartId = req.params.cartId;
    try {
      const product = await cartModel.destroy({
        where: {
          id: cartId,
        },
      });
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `user removed the document from cart`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "Document Deleted Successfully" });
    } catch (e) {
      console.log(e);
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user removing the document from cart, Error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }
  async downloadDocument(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Download document";
    try {
      /**logged in user details */
      const user = req.user;
      /**get document id */
      const documentId = req.params.documentId;
      const cartId = req.params.cartId;
      /**get document details */
      const document = await resourcesModel.findOne({
        where: { id: documentId },
      });
      const rawDocument = await resourcesModel.findOne({
        where: { id: documentId },
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
      /*/ Generate the ZIP file*/
      const file = `${global.documentPath}/${document.fileName}`;
      const fileExtension = path.extname(document.fileName);
      const removeDocumentFormCart = await cartModel.destroy({
        where: { resourceId: documentId },
      });
      /** adding the document to download list */
      await userDownloadedDocumentsModel.create({
        userId: user.userId,
        resourceId: documentId,
      });
      /*/ Set the response headers for file download*/
      res.set("Content-Type", "application/zip");
      res.set("Content-Disposition", 'attachment; filename="documents.zip"');
      /**activity type */
      activity.type = activityTypes.INFO;
      //Capture download document report
      await reportManagement.documentReport(
        rawDocument,
        req.user.userId,
        "download"
      );

      /**add activity description */
      activity.description = `User Downloaded the documents`;
      /**add user activity */
      addUserActivity(activity);
      res.download(file); // Set disposition and send it.
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occur while user downloading the documents, Error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }
  async downloadMultipleDocument(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Download multiple documents";
    try {
      /** */
      const user = req.user;
      const cartData = await cartModel.findAll({
        include: [{ model: resourcesModel }],
        where: { userId: user.userId },
      });

      const data = req.body;

      const zip = new AdmZip();
      /*/ Filter the files based on the provided file names*/
      await Promise.all(
        cartData.map(async (cart) => {
          const filePath = path.join(
            global.documentPath,
            cart.resource.fileName
          );
          await userDownloadedDocumentsModel.create({
            userId: user.userId,
            resourceId: cart.resource.id,
          });
          //Capture download document report
          const rawDocument = await resourcesModel.findOne({
            where: { id: cart.resource.id },
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

          if (fs.existsSync(filePath)) {
            zip.addLocalFile(filePath);
            //Capture download document report
            await reportManagement.documentReport(
              rawDocument,
              req.user.userId,
              "download"
            );
          } else {
            console.warn(`File not found: ${filePath}`);
          }
        })
      );
      // console.log(zip)
      /*/ Generate the ZIP file*/
      const zipData = zip.toBuffer();
      /** remove the documents from cart */
      await cartModel.destroy({
        where: { userId: req.user.userId },
      });
      /*/ Set the response headers for file download*/
      res.set("Content-Type", "application/zip");
      res.set("Content-Disposition", 'attachment; filename="documents.zip"');
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User downloaded all the documents`;
      /**add user activity */
      addUserActivity(activity);
      /*/ Send the ZIP file to the client for download*/
      res.send(zipData);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occur while user downloading all the documents, Error : ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }

  // to fetch the resources of particular training type after view more button click
  async getParticularTrainingTypeResources(req, res) {
    const user = req.user;
    const trainignId = req.params.trainingId;
    try {
      const resources = await resourcesModel.findAll({
        where: {
          trainingType: trainignId,
        },
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(CASE WHEN (favourite_documents.documentId= resources.id AND favourite_documents.userId=${user.userId}) THEN 1 ELSE 0 END)`
              ),
              "addedToFavourites",
            ],
          ],
        },
        include: [{ model: favouriteDocumentsModel, attributes: [] }],
      });
      res.send(resources);
    } catch (e) {
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }

  /**global search for member for  */
  async globalDocumentSearch(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "document search";
    /**search parameter in query string */
    const search = req.query?.search?.trim();
    try {
      const user = req.user;
      const data = req.body;
      if (!search && Object.keys(data).length == 0)
        return res.send({ searchedData: [] });
      const where = {};
      const whereOr = [];
      if (search) whereOr.push({ documentName: { [Op.like]: `%${search}%` } });
      if (search)
        whereOr.push({ documentDescription: { [Op.like]: `%${search}%` } });
      if (search) whereOr.push({ language: { [Op.like]: `%${search}%` } });
      if (search) whereOr.push({ resourceName: { [Op.like]: `%${search}%` } });
      if (search)
        whereOr.push({ resourceDescription: { [Op.like]: `%${search}%` } });
      // if (search)
      // whereOr.push({ "$subjects.name$": { [Op.like]: `%${search}%` } });
      if (search)
        whereOr.push({
          "$subjects.description$": { [Op.like]: `%${search}%` },
        });
      if (search)
        whereOr.push({
          "$training_type.trainingName$": { [Op.like]: `%${search}%` },
        });

      /**set where for query */
      if (whereOr.length !== 0) where[Op.or] = whereOr;
      let whereAnd = [];
      whereAnd.push({ view: true });
      if (data?.language?.length > 0)
        whereAnd.push({ language: { [Op.in]: data.language } });
      if (data?.level?.length > 0)
        whereAnd.push({ level: { [Op.in]: data.level } });
      if (data?.trainingName?.length > 0)
        whereAnd.push({ "$training_type.id$": { [Op.in]: data.trainingName } });
      if (data?.subject?.length > 0)
        whereAnd.push({ "$subjects.id$": { [Op.in]: data.subject } });
      where[Op.and] = whereAnd;

      /**if array of or is empty then set where to empty  */
      const documents = await resourcesModel.findAll({
        where: where,
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(CASE WHEN (favourite_documents.documentId= resources.id AND favourite_documents.userId=${user.userId}) THEN 1 ELSE 0 END)`
              ),
              "addedToFavourites",
            ],
          ],
        },
        include: [
          { model: trainingTypeModel },
          { model: subjectsModel, attributes: ["id"] },
          { model: favouriteDocumentsModel, attributes: [] },
        ],
      });
      // Add 'isExpired' property to each resource object
      const resourcesWithExpiration = await Promise.all(
        documents.map(async (resource) => {
          const isExpired = await checkResourceIsExpired(resource);
          return { ...resource.toJSON(), isExpired };
        })
      );
      return res.send({ searchedData: resourcesWithExpiration });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `user added search for resources , search parameters : ${search}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async DownloadsLists(req, res) {
    const userId = req.user.userId;
    try {
      const documents = await DownloadedDocumentsModal.findAll({
        where: {
          userId: userId,
        },
        include: [{ model: resourcesModel, include: trainingTypeModel }],
      });
      return res.send(documents);
    } catch (e) {
      console.log(e);
    }
  }

  // Grab the all levels
  async fetchAllLevels(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get all levels";
    try {
      // Query to Fetch the document levels
      const documentLevels = await documentLevel.findAll({
        attributes: ["id", "level"],
      });
      // return the response
      return res.send({ levels: documentLevels });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the listing of all documents levels, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
    }
  }

  async videoWatchVideo(req, res) {
    const userId = req.user.userId;
    try {
      /**get data from body */ const data = req.body;

      // console.log(data);
      const rawDocument = await resourcesModel.findOne({
        where: { id: data.documentId },
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
      if (data.watchedTime) {
        const watchTime = secondsToHMS(data.watchedTime);
        rawDocument.watchedTime = watchTime;
      }
      // console.log(rawDocument);
      await reportManagement.documentReport(rawDocument, userId, "view");
      return res.send("");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = resources;
