require("dotenv").config();
const trainingModel = require("../models/trainingType");
const resourceModel = require("../models/resources");
const helper = require("../helpers/helper");
const { Op, Sequelize, json } = require("sequelize");
const moment = require("moment");
const usersModal = require("../models/users");
const favoriteDocumentsModel = require("../models/favouriteDocuments");
const db = require("../config/db");
const subjects = require("../models/subjects");
const resourcesHaveSubjects = require("../models/resourcesHaveSubjects");
const { activity, activityTypes, addUserActivity } = require("../helpers/logs");

class trainingType {
  constructor() {}
  async add(req, res) {
    var response = '';
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Add new training type";
    try {
      let data = req.body;
      data.addedByUser = req.user.userId;

      // Verify entry is exist
      const entryExist = await trainingModel.findOne({
        where: {
          trainingName : data.trainingName,
        }
      });
      // if yes then return the duplicate entry record message
      if(entryExist) {
        response = { message: "Duplicate Entry" , status:302 };
      } else {

        // Add the entry
        await trainingModel.create(data);

        /**activity type */
        activity.type = activityTypes.INFO;

        /**add activity description */
        activity.description = `User Added the new training type, training type name: ${data.trainingName}`;

        /**add user activity */
        addUserActivity(activity);

        response = { message: "Training Type Is Added", status: 200};
      }
      res.send(response);
    } catch (e) {
      console.log(e);
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user creating new subject, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      return res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async getAll(req, res) {
    try {
      let Trainings;
      const user = req.user;
      const qString = req.query;
      const where = {};
      const includeWhere = {};

      if (![1, 2].includes(user.role)) {
        where.addedByUser = user.userId;
      }

      // Validate and handle pagination parameters
      // (Your existing validation code here...)

      // Get pagination settings
      const { limit, offset } = helper.getPagination(
        qString.page,
        qString.size
      );
      const sort = helper.getSortingUsers(qString);

      const or = [];
      const includeOr = [];
      if (qString.trainingName) {
        or.push({ trainingName: { [Op.like]: `%${qString.trainingName}%` } });
      }
      if (qString.addedByUser) {
        or.push({
          "$user.username$": { [Op.like]: `%${qString.addedByUser}%` },
        });
        includeOr.push({ username: { [Op.like]: `%${qString.addedByUser}%` } });
      }

      // Add search conditions to the 'where' and 'includeWhere' objects
      if (or.length > 0) {
        where[Op.or] = or;
      }

      if (includeOr.length > 0) {
        includeWhere[Op.or] = includeOr;
      }

      let whereAnd = [];

      if (qString.all) {
        whereAnd.push({ status: true });
        Trainings = await trainingModel.findAll({
          where: whereAnd,
        });
        return res.send(Trainings);
      } else {
        // Modify the include block to use the model and as properties
        Trainings = await trainingModel.findAndCountAll({
          include: [
            {
              model: usersModal,
              as: "user", // Change 'user' to the actual alias if you have one
              // Where: includeWhere
            },
          ],
          where: where,
          order: [sort],
          limit,
          offset: offset,
        });

        // Get pagination data and send the response
        const TrainingsWithPagination = helper.getPaginationData(
          Trainings,
          qString.page,
          limit
        );
        return res.send(TrainingsWithPagination);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send({
        message: "An error occurred while processing the request",
        error: e,
      });
    }
  }

  async getAllActive(req, res) {
    try {
      const Trainings = await trainingModel.findAll({
        include: usersModal,
        where: { status: true },
      });
      res.send({ training: Trainings });
    } catch (e) {
      console.log(e);
      return res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  //    To delete the training type
  async delete(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Deleted the training type";
    const trainingId = req.params.id;
    try {
      const trainingType = await trainingModel.destroy({
        where: {
          id: trainingId,
        },
      });

     /**activity type */
     activity.type = activityTypes.INFO;
     /**add activity description */
     activity.description = `User deleted the training type ,training type id: ${trainingId}`;
     /**add user activity */
     addUserActivity(activity);
      res.send({ message: "Training Deleted Successfully" });
    } catch (e) {
      console.log(e);
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user deleting the training type ,training type id: ${trainingId}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      return res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  /* get single training type */
  async getOne(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get single training type details";
    const trainingId = req.params.id;
    try {
      const singleTraining = await trainingModel.findOne({
        where: {
          id: trainingId,
        },
      });
      res.send(singleTraining);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the single training type details, training type id: ${trainingId}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async update(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Updating the training type";
    const data = req.body;
    console.log("data", data);
    const trainingId = req.params.id;
    try {
      const trainingNameExits = await trainingModel.findAll({
        where: {
          id: trainingId,
        },
      });
      if (trainingNameExits.length === 0) {
        const trainingNameExits = await trainingModel.findOne({
          where: {
            trainingName: data.trainingName,
          },
        });
        if (trainingNameExits)
          return res
            .status(210)
            .send({ message: "Training Type Is Exists With Given Name" });
      }
      const courses = await trainingModel.update(data, {
        where: {
          id: trainingId,
        },
      });
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User updated the training type, training type ids: ${trainingId}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "Training Type Updated Successfully" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user updating the training type, training type ids: ${trainingId}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }

  /** enable disable the courses */
  async enableDisableTraining(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Updating the training type status";
    const trainingId = req.params.id;
    const data = req.body;
    const status = (data.status)?'enabled':"disabled"

    try {
      const enableDisble = await trainingModel.update(data, {
        where: {
          id: trainingId,
        },
      });
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User ${status} the training type status, training type id : ${trainingId}`;
      /**add user activity */
      // addUserActivity(activity);
      res.send({ message: "Training Status is Updated" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user ${status} the training type status, training type id : ${trainingId}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  /***get popular training type */
  async popularTrainingType(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get popular training types";
    try {
      const qString = req.query;
      const user = req.user;
      let queryParameters = {
        include: [
          {
            model: resourceModel,
            include: [{ model: favoriteDocumentsModel }, { model: subjects }],
          },
        ],
        attributes: {
          include: [
            [
              Sequelize.literal(
                "(SELECT COUNT(id) FROM resources WHERE resources.trainingType = training_type.id)"
              ),
              "total_documents",
            ],
          ],
        },
        order: [[Sequelize.literal("total_documents"), "DESC"]],
        limit: 5,
        offset: 0,
      };

      if (qString.all) {
        // You can add additional conditions here if needed
      }

      const trainingTypes = await trainingModel.findAll(queryParameters);
      trainingTypes.map((t, i) => {
        t.resources.map((r, j) => {
          if (r.favourite_documents.length > 0) {
            const haveFav = r.favourite_documents.filter(
              (f) => f.documentId == r.id && f.userId == user.userId
            );
            if (haveFav.length > 0) {
              trainingTypes[i].resources[j].inFavourites = 1;
            }
          }
        });
      });
      res.send(trainingTypes);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user User get the popular training types by popularTrainingsTypes API`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(500)
        .send({ message: "Error occurred while processing", error: e });
    }
  }

  async bulkOperation(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Training type bulk operation";
    try {
      const data = req.body;
      let action;
      if (data.action.toLowerCase() === "delete") {
        action = await trainingModel.destroy({
          where: { id: { [Op.in]: data.id } },
        });
      } else if (data.action.toLowerCase() === "enable") {
        action = await trainingModel.update(
          { status: true },
          { where: { id: { [Op.in]: data.id } } }
        );
      } else if (data.action.toLowerCase() === "disable") {
        action = await trainingModel.update(
          { status: false },
          { where: { id: { [Op.in]: data.id } } }
        );
      } else {
        return res.status(400).send({ message: "Invalid action" });
      }
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User ${data.action}d the Training type, Training type ids: ${data.id}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({
        message: `Selected Trainings Are ${data.action.toLowerCase()}d`,
      });
    } catch (e) {
      console.log(e);
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user performing the bulk operation in resources,action: ${req.body.action} Training type ids ${req.body.id}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      res.status(250).send({
        message: "Error occurred while processing the request",
        error: e,
      });
    }
  }

  async getTrainingName(req, res) {
    try {
      const trainingId = req.params.trainingId;
      console.log("trainingId", trainingId);
      const trainingDetails = await trainingModel.findOne({
        where: { id: trainingId },
      });
      res.send(trainingDetails);
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "Error occurred while processing the request",
        error: e,
      });
    }
  }
}

module.exports = trainingType;
