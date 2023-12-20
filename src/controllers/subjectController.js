require("dotenv").config();
const subjectsModel = require("../models/subjects");
const resources = require("../models/resources");
const helper = require("../helpers/helper");
const { Op, Sequelize } = require("sequelize");
const { validationResult } = require("express-validator");
const trainingTypeModel = require("../models/trainingType");
const resourcesModel = require("../models/resources");
const { activity, activityTypes, addUserActivity } = require("../helpers/logs");

class subjectController {
  /* get All subjects */
  async getAll(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get all subject (getAll)";
    try {
      /**get all data from query string */
      const qString = req.query;
      /** validate the page and size from query string */
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
      /** spliting the where before run the query*/
      const where = {};
      const whereAnd = [];
      /** get enable and disable value for listing */
      const view = helper.getEnabledDisabled(qString);
      whereAnd.push(view);
      /**  */
      const whereOr = [];
      if (qString.subject)
        whereOr.push({ name: { [Op.like]: `%${qString.subject}%` } });
      where[Op.and] = whereAnd;
      if (whereOr.length !== 0) where[Op.or] = whereOr;
      /**get sorting */
      const sort = helper.getSortedSubjects(qString);
      /**get limit and offset for passing in query  */
      const { limit, offset } = helper.getPagination(
        qString.page,
        qString.size
      );

      if (qString.all) {
        let subject = await subjectsModel.findAll({
          order: [sort],
          where: where,
        });
        return res.send(subject);
      }
      /**get courses according to limit and offset */
      let subject = await subjectsModel.findAll({
        order: [sort],
        where: where,
        // limit: limit,
        // offset: offset
      });
      /**get required pagination structure */
      // subject = helper.getPaginationData(subject, qString.page, limit);
      subject.map((c, i) => {
        subject[
          i
        ].image_url = `${process.env.SITE_URL}${process.env.SUBJECTS_IMAGES_PATH}/${c.image}`;
      });
      /**return the request */
      return res.send(subject);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the listing of all subects`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async getparticularUserSubjects(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get all subject (getparticularUserSubjects)";
    try {
      /**get all data from query string */
      const qString = req.query;
      /** validate the page and size from query string */
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
      /** spliting the where before run the query*/
      const where = {};
      where.addedByUser = req.user.userId;
      const whereAnd = [];
      /** get enable and disable value for listing */
      const view = helper.getEnabledDisabled(qString);
      whereAnd.push(view);
      /**  */
      const whereOr = [];
      if (qString.subject)
        whereOr.push({ name: { [Op.like]: `%${qString.subject}%` } });
      where[Op.and] = whereAnd;
      if (whereOr.length !== 0) where[Op.or] = whereOr;
      /**get sorting */
      const sort = helper.getSortedSubjects(qString);
      /**get limit and offset for passing in query  */
      const { limit, offset } = helper.getPagination(
        qString.page,
        qString.size
      );
      /**get courses according to limit and offset */
      let subjects = await subjectsModel.findAll({
        order: [sort],
        where: where,
        // limit: limit,
        // offset: offset
      });
      /**get required pagination structure */
      // courses = helper.getPaginationData(courses, qString.page, limit);
      subjects.map((c, i) => {
        subjects[
          i
        ].image_url = `${process.env.SITE_URL}${process.env.SUBJECTS_IMAGES_PATH}/${c.image}`;
      });
      /**return the request */
      return res.send(subjects);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the listing of all subects`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  /* adding the new subject */
  async add(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Add new subject";
    const error = validationResult(req);
    if (req?.file?.fieldname !== "image")
      return res
        .status(220)
        .send({ error: "Image is required", message: "All Fields Required" });
    if (!error.isEmpty())
      return res
        .status(220)
        .send({ error: error.array(), message: "All Fields Required" });
    const data = req.body;
    data.addedByUser = req.user.userId;
    data.image = req?.file?.originalname;
    data.image_url = process.env.SUBJECTS_IMAGES_PATH;
    data.name = data.name?.trim();
    // console.log(data)
    try {
      /** if subject name already exists */
      const subjectExists = await subjectsModel.findOne({
        where: {
          name: data.name,
        },
      });
      /**then return */
      if (subjectExists)
        return res
          .status(210)
          .send({ message: "subject with given name already exists" });
      /**other wise create new one */
      const subjects = await subjectsModel.create(data);
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User Added the new subject, subject name: ${data.name}`;
      /**add user activity */
      addUserActivity(activity);
      /**return the request */
      return res.send({ message: "Subject Added Successfully" });
    } catch (e) {
       /**activity type */
       activity.type = activityTypes.ERROR;
       /**activity type */
       activity.error = e.stack;
       /**add activity description */
       activity.description = `Error occure while user creating new subject, error: ${e}`;
       /**add user activity */
       addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }
  /* update the subjects */
  async update(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Updating the subject details";
    /** get form data from req body*/
    const data = req.body;
    const subjectId = req.params.id;
    /** get image */
    data.image = req?.file?.originalname;
    data.image_url = process.env.SUBJECTS_IMAGES_PATH;
    try {
      /** checking the enter subject name is changed */
      const subjectExists = await subjectsModel.findAll({
        where: {
          name: data.name,
          id: subjectId,
        },
      });
      /**if changed then check that changed name exists or not */
      if (subjectExists.length === 0) {
        /** checking the name exists or not */
        const subjectExists = await subjectsModel.findOne({
          where: {
            name: data.name,
          },
        });
        /**if exists then return the result */
        if (subjectExists)
          return res
            .status(210)
            .send({ message: "subject is exists with given name" });
      }
      /**update the subjects details */
      const subjects = await subjectsModel.update(data, {
        where: {
          id: subjectId,
        },
      });
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User updated the subject, subject id : ${subjectId}`;
      /**add user activity */
      addUserActivity(activity);
      /**return the response */
      res.send({ message: "Subject Updated Successfully" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while updating the subject details, Error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while proccesing", error: e });
    }
  }
  /* delete the subjects */
  async delete(req, res) {
      /**sending req */
      activity.req = req;
      /** activity name */
      activity.name = "Delete subject";
    /**get subject id from params */
    const subjectId = req.params.id;
    try {
      /** Deleting the subject */
      const subjects = await subjectsModel.destroy({
        where: {
          id: subjectId,
        },
      });
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User deleted the subject, subject id: ${subjectId}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "Subject Deleted Successfully" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user deleting the subject, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while processing", error: e });
    }
  }
  /* get single course */
  async getOne(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Single subject details";
    const subjectId = req.params.id;
    try {
      const singleSubject = await subjectsModel.findOne({
        where: {
          id: subjectId,
        },
      });
      singleSubject.image_url = `${process.env.SITE_URL}${process.env.SUBJECTS_IMAGES_PATH}/${singleSubject.image}`;
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User get subject details, subject id: ${subjectId}`;
      /**add user activity */
      addUserActivity(activity);
      res.send(singleSubject);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the single subject details subject id: ${req.params.id} , error: ${e} `;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /** enable disable the subjects */
  async enableDisableSubject(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Updating the subject status";
    const subjectId = req.params.id;
    const data = req.body;
    try {
      const enableDisble = await subjectsModel.update(data, {
        where: {
          id: subjectId,
        },
      });
      const status = (data.view)?"enable":"disable"
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User updated the subject  status to ${status}, subject id: ${subjectId}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "subject status is updated" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user updating the subject status, subject id: ${req.params.id}, error: ${e}`;
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
      activity.name = "Subjects Bulk operation";
    try {
      const data = req.body;
      let action;
      if (data.action == "delete")
        action = await subjectsModel.destroy({
          where: { id: { [Op.in]: data.id } },
        });
      if (data.action == "enable")
        action = await subjectsModel.update(
          { view: true },
          { where: { id: { [Op.in]: data.id } } }
        );
      if (data.action == "disable")
        action = await subjectsModel.update(
          { view: false },
          { where: { id: { [Op.in]: data.id } } }
        );
       /**activity type */
       activity.type = activityTypes.INFO;
       /**add activity description */
       activity.description = `User ${data.action}d the subjects, subject ids: ${data.id}`;
       /**add user activity */
       addUserActivity(activity);
      res.send({ message: `Selected Subjects Are ${data.action}d` });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user performing the bulk operation in subjects,action: ${req.body.action} subject ids ${req.body.id}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  async getAllSubject(req, res) {
    try {
      /**sending req */
      activity.req = req;
      /** activity name */
      activity.name = "Get all subject";
      const subjects = await subjectsModel.findAll({
        attributes: ["id", "name"],
        where: { view: true },
      });
      res.send(subjects);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the listing of all subects (getAllSubject)`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res
        .status(250)
        .send({ message: "error occure while processing", error: e });
    }
  }
}
module.exports = subjectController;
