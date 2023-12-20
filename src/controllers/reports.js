require("dotenv").config();
const reportsModel = require("../models/reports");
const documentReportLog = require("../models/documentReportLogs");
const documentReportActivities = require("../models/documentReportActivities");
const helper = require("../helpers/helper");
const rolesModel = require("../models/roles");
const usersModel = require("../models/users");
const userTimeSpent = require("../models/userTimeSpent");
const express = require("express");
const app = express();
const { Op, Sequelize } = require("sequelize");
const { activity, activityTypes, addUserActivity } = require("../helpers/logs");
class reports {
  async DataReport(req, res) {
    try {
      const sort = helper.getSortingReports(req.query);

      const DataReturn = await reportsModel.findAll();

      return res.json({ data: DataReturn });
    } catch (error) {
      console.error("Error checking resource expiration:", error);
      throw error;
    }
  }

  async DataDownload(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get downlaod data";
    try {
      const query = req.query;
      const whereOr = [];
      let memberAccounts = "";
      // Verify page of data is valid
      if (query.page) {
        if (query.page < 0 || !query.page.match("^[0-9]*$"))
          return res.send({
            error: "page in query string can't be negative  and string",
          });
      }
      // Verify size of data is valid
      if (query.size) {
        if (query.size <= 0 || !query.size.match("^[0-9]*$"))
          return res.send({
            error: "size in query string must be greater than 0  and string",
          });
      }
      // Filtering the queryString data as per the table columns
      const sort = helper.getSortingReports(query);
      const or = [];
      if (query.resourceName)
        or.push({ resourceName: { [Op.like]: `%${query.resourceName}%` } });
      if (query.documentName)
        or.push({ documentName: { [Op.like]: `%${query.documentName}%` } });
      if (query.favourites)
        or.push({ favourites: { [Op.like]: `%${query.favourites}%` } });
      if (query.downloads)
        or.push({ downloads: { [Op.like]: `%${query.downloads}%` } });
      if (query.views) or.push({ views: { [Op.like]: `%${query.views}%` } });
      if (query.averageWatchedTime)
        or.push({
          averageWatchedTime: { [Op.like]: `%${query.averageWatchedTime}%` },
        });
      if (query.finish) or.push({ finish: { [Op.like]: `%${query.finish}%` } });
      // const { limit, offset } = helper.getPagination(query.page, query.size);
      const baseQuery = {
        order: [sort],
      };
      if (or.length > 0) {
        whereOr.push({ [Op.or]: or });
      }
      const whereAnd = { [Op.and]: [{ type: 2 }, whereOr] };
      baseQuery.where = whereAnd;

      // Fething the count and data of the report of the document
      let DataReturn = await documentReportLog.findAll(baseQuery);

      let userActivity = await documentReportActivities.findAll({
        include: {
          model: documentReportLog,
          attributes: ['documentName','resourceName']
        },
        where:{
          'type': 3
        }
      });

      // If authenticated user is manager then fetch only assigned members
      if (req.user.role === 3) {
        // Fetch assign members
        memberAccounts = await usersModel.findAll({
          include: [
            {
              model: rolesModel,
              where: { id: 5 },
            },
            {
              model: usersModel,
              where: { id: req.user.userId },
              as: "member_manager",
            },
          ],
        });
      } else {
        // Fetch all member accounts
        memberAccounts = await rolesModel.findAll({
          where: {
            id: 5,
          },
          include: usersModel,
        });
      }

      return res.send({
        documentReport: DataReturn,
        memberAccounts: memberAccounts,
        allUserActivity: userActivity
      });
    } catch (error) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = error.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the download data, Error : ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.error("Error checking resource expiration:", error);
      throw error;
    }
  }

  async memberReport(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get member report";
    try {
      const query = req.query;
      // Verify page of data is valid
      if (query.page) {
        if (query.page < 0 || !query.page.match("^[0-9]*$"))
          return res.send({
            error: "page in query string can't be negative and string",
          });
      }

      // Verify size of data is valid
      if (query.size) {
        if (query.size <= 0 || !query.size.match("^[0-9]*$"))
          return res.send({
            error: "size in query string must be greater than 0 and string",
          });
      }

      // Filtering the queryString data as per the table columns
      const sort = helper.getSortingReports(query);

      const or = [];
      const whereOr = [];
      let memberAccounts = "";

      if (query.userName)
        or.push({ userName: { [Op.like]: `%${query.userName}%` } });
      if (query.userEmail)
        or.push({ userEmail: { [Op.like]: `%${query.userEmail}%` } });
      if (query.phoneNumber)
        or.push({ phoneNumber: { [Op.like]: `%${query.phoneNumber}%` } });
      if (query.address)
        or.push({ address: { [Op.like]: `%${query.address}%` } });
      if (query.companyName)
        or.push({ companyName: { [Op.like]: `%${query.companyName}%` } });
      if (query.finish) or.push({ finish: { [Op.like]: `%${query.finish}%` } });
      if (query.downloads)
        or.push({ downloads: { [Op.like]: `%${query.downloads}%` } });
      if (query.views) or.push({ views: { [Op.like]: `%${query.views}%` } });
      if (query.favourites)
        or.push({ favourites: { [Op.like]: `%${query.favourites}%` } });

      const baseQuery = {
        order: [sort],
      };

      if (or.length > 0) {
        whereOr.push({ [Op.or]: or });
      }

      const whereAnd = { [Op.and]: [{ type: 2 }, whereOr] };

      baseQuery.where = whereAnd;

      // Fething the count and data of the report of the document
      let DataReturn = await documentReportActivities.findAll(baseQuery);

      let resourceActivity = await documentReportLog.findAll({
        include: {
          model: documentReportActivities,
          attributes: ['userName','userEmail']
        },
        where:{
          'type': 3
        }
      });
      

      // If authenticated user is manager then fetch only assigned members
      if (req.user.role === 3) {
        // Fetch assign members
        memberAccounts = await usersModel.findAll({
          include: [
            {
              model: rolesModel,
              where: { id: 5 },
            },
            {
              model: usersModel,
              where: { id: req.user.userId },
              as: "member_manager",
            },
          ],
        });
      } else {
        // Fetch all member accounts
        memberAccounts = await rolesModel.findAll({
          where: {
            id: 5,
          },
          include: usersModel,
        });
      }

      return res.send({
        memberReport: DataReturn,
        memberAccounts: memberAccounts,
        allResourceActivity: resourceActivity

      });
    } catch (error) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = error.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the member report, error : ${error}`;
      /**add user activity */
      addUserActivity(activity);
      console.error("Error checking resource expiration:", error);
      throw error;
    }
  }

  async documentActivity(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get document activity";
    try {
      const query = req.query;
      const or = [];
      const where = [];
      let activityType;
      const documentId = req.params.documentId;
      let document = "";
      let accountActivityCount = "";
      let accountActivity;
      // const activityType = (req.params.type == 'favourite')? 22 : 23 ;
      switch (req.params.type) {
        case "favourite":
          activityType = ["22"];
          break; // Add this break statement

        case "download":
          activityType = ["23"];
          break; // Add this break statement

        case "view":
          activityType = ["24"];
          break; // Add this break statement
        case "all-category":
          activityType = ["22", "23", "24"];
          break;
        default:
          return res.status(210).send({ message: "Invalid request type." });
      }
      if (req.params.activityType == "resources") {
        if (query.userName)
          or.push({ userName: { [Op.like]: `%${query.userName}%` } });
        if (query.userEmail)
          or.push({ userEmail: { [Op.like]: `%${query.userEmail}%` } });
        if (query.phoneNumber)
          or.push({ phoneNumber: { [Op.like]: `%${query.phoneNumber}%` } });
        if (query.address)
          or.push({ address: { [Op.like]: `%${query.address}%` } });
        if (query.companyName)
          or.push({ companyName: { [Op.like]: `%${query.companyName}%` } });
        if (query.createdAt)
          or.push({ createdAt: { [Op.like]: `%${query.createdAt}%` } });

        where.push({
          [Op.and]: [
            {
              documentReportId: documentId,
              activityType: activityType,
              type: 3, // Fetch the child row of the document
            },
          ],
        });

        if (or.length > 0) {
          where.push({
            [Op.or]: or,
          });
        }
        const sort = helper.getSortingReports(query);

        document = await documentReportLog.findAll({
          where: {
            id: {
              [Op.eq]: documentId,
            },
          },
        });

        accountActivity = await documentReportActivities.findAll({
          where: where,
          order: [sort],
        });
      } else {
        if (query.resourceName)
          or.push({ resourceName: { [Op.like]: `%${query.resourceName}%` } });
        if (query.documentName)
          or.push({ documentName: { [Op.like]: `%${query.documentName}%` } });
        if (query.language)
          or.push({ language: { [Op.like]: `%${query.language}%` } });
        if (query.trainingType)
          or.push({ trainingType: { [Op.like]: `%${query.trainingType}%` } });
        where.push({
          [Op.and]: [
            {
              documentReportActivityId: documentId,
              activityType: activityType,
              type: 3, // Fetch the child row of the document
            },
          ],
        });

        const { limit, offset } = helper.getPagination(query.page, query.size);
        if (or.length > 0) {
          where.push({
            [Op.or]: or,
          });
        }
        const sort = helper.getSortingReports(query);

        document = await documentReportActivities.findAll({
          where: {
            id: {
              [Op.eq]: documentId,
            },
          },
          sort: sort,
        });

        accountActivity = await documentReportLog.findAll({
          where: where,
          order: [sort]
        });
      }

      return res.send({
        document: document,
        documentInfo: accountActivity,
      });
    } catch (error) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = error.stack;
      /**add activity description */
      activity.description = `Error occure while user getting document activity, error : ${error}`;
      /**add user activity */
      addUserActivity(activity);
      console.error("Error checking resource expiration:", error);
      throw error;
    }
  }

  async find(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get chart data";
    try {
      const query = req.query;
      const startDate = helper.formatDate(query.startDate, 'start');
      const endDate = helper.formatDate(query.endDate, 'end');
      const accountId = query.accountId;
      const chartData = [];
      const where = [];
      var accountTime = '';
      var memberAccounts = '';
      var managerAssignedUserId = [];
      const chartLabel = helper.fetchMonthYear(startDate, endDate);

      for (const value of chartLabel) {
        const label = value.split(" ");

        const changeFormat = helper.fetchStartedEndMonthDate(
          label[0],
          label[1]
        );

        let whereCondition = {
          date: {
            [Op.between]: [changeFormat.startDate, changeFormat.endDate],
          },
        };

        if (accountId) {
          whereCondition["userId"] = accountId;
        }

        let accountTime = await userTimeSpent.sum("totalTimeSpent", {
          where: whereCondition,
        });
        accountTime = accountTime == null ? 0 : accountTime;
        chartData.push(accountTime);
      }

      // If authenticated user is manager then fetch only assigned members
      if (req.user.role === 3) {

        // Fetch assign members
        memberAccounts = await usersModel.findAll({
          attributes: ['id'],
          include: [
            { model: rolesModel, where: { id: 5 }, attributes: ['id']}, 
            { model: usersModel, where: { id: req.user.userId }, as: 'member_manager'}
          ],
          raw : true
        });
        
        // loop for fetching the assigned member 
        memberAccounts.forEach(async element => { 
            managerAssignedUserId.push(element.id);
          });

        // Set the id in where condition to fetch the member time spent only of assigned manager
        whereCondition['userId'] = {in: managerAssignedUserId};
      } 
      
      // Grab the user time spent and sum the minute
      accountTime = await userTimeSpent.sum('totalTimeSpent', {
          where: whereCondition
        });

      accountTime = (accountTime == null) ? 0 : accountTime;
      chartData.push(accountTime);
      
      return res.send({ chartData, chartLabel });

    } catch (error) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = error.stack;
      /**add activity description */
      activity.description = `Error occure while user getting chart data, error : ${error}`;
      /**add user activity */
      addUserActivity(activity);
      console.error("Error checking resource expiration:", error);
      throw error;
    }
  }
}

module.exports = reports;
