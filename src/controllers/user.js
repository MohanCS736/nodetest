require("dotenv").config();
const usersModel = require("../models/users");
const rolesModel = require("../models/roles");
const userHaveRolesModel = require("../models/userHaveRoles");
const assignManager = require("../models/ContributorAssignedManager");
const memberAssignedManager = require("../models/MemberAssignedManagers");
const Mail = require("../classes/sendMail");
const subject = require("../config/subject_" +
  process.env.APP_ENV +
  "_config.json");
const resourcesModel = require("../models/resources");
const modelsDocumentPermission = require("../models/modelDocumentPermissions");
const documentAccessRequestModel = require("../models/documentAccessRequest");
const userTimeSpentModel = require("../models/userTimeSpent");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const helper = require("../helpers/helper");
const crypto = require("crypto");
const managerHavePermissions = require("../models/managerHavePermissions");
const PermissionsModel = require("../models/permissions");
const ContactModal = require("../models/contentUS");
const managerAssignedStatesModel = require("../models/managerAssignedStates");
const {
  activity,
  activityTypes,
  addUserActivity,
  usersRole,
  activityTypesArray,
} = require("../helpers/logs");
const tokenstring = require("../controllers/Authenticator");
const userActivityModel = require("../models/userActivity");
const htmlTemplate = (message) => {
  const template = `<table width="600" cellpadding="0" cellspacing="0" border="0" align="center" > <tbody> <tr> <td> <table width="100%" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr style="background-color: rgba(244, 244, 244, 1)"> <td style="padding: 20px 15px; text-align: center"> <a href="" ><img src="https://klgreact.csdevhub.com/assets/logo.png" width="150" height="44" alt="" /></a> </td> </tr> <tr> <td style="padding: 35px 15px"> <table width="100%" cellpadding="0" cellspacing="0" border="0" > <tbody> <tr> <td style=" font-size: 22px; font-family: Arial, sans-serif; font-weight: bold; padding: 0 0 20px; " > Greetings, </td> </tr> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; " >${message} 
  </td> </tr> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; padding: 25px 0 15px; " > This email comes from an unmonitored box. Do not reply to this email. </td> </tr> </tbody> </table> </td> </tr> <tr style="background-color: rgba(244, 244, 244, 1)"> <td style="padding: 10px 15px"> <table width="100%" cellpadding="0" cellspacing="0" border="0" > <tbody> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; font-weight: bold; text-align: center; padding: 0 0 5px; " > Thanks </td> </tr> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; text-align: center; " > KLG Team </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table>`;
  return template;
};

class user {
  constructor(data) {
    this.roleId = data?.roleId;
  }
  async signup(req, res) {
    try {
      const { email, otherData } = req.body;
      const data = req.body;
      data.username = email;
      // Check if the email already exists in the database
      const existingUser = await usersModel.findOne({
        where: { email: email },
      });

      if (existingUser) {
        // Email already exists, send an error response
        return res.status(200).json({ message: "Email already exists" });
      }
      /* Email does not exist, create a new user*/
      const newUser = await usersModel.create(data);

      /* Generate the sender link for verify the register email address.*/
      const mail = new Mail();
      /** find the manager of same country member  */
      const managers = await managerAssignedStatesModel.findAll({
        where: { country: data.country },
      });
      let message = `<table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
                        <tbody>
                            <tr>
                                <td>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                            <tr style="background-color: rgba(244, 244, 244, 1)">
                                                <td style="padding: 20px 15px; text-align: center"> <a href=""><img
                                                            src="https://klgreact.csdevhub.com/assets/logo2.png" width="150" height="44"
                                                            alt="" /></a> </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 35px 15px">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td
                                                                style=" font-size: 22px; font-family: Arial, sans-serif; font-weight: bold; padding: 0 0 20px; ">
                                                                Greetings, </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <table cellpadding="10" cellspacing="0" border="1" style="border-collapse: collapse;" width="100%">
                                                                    <tr>
                                                                        <td>message</td>
                                                                        <td>This email is to inform you that, on registeration  
                                                                        no manager found for member  email : '${email}'</td>
                                                                    </tr>
                                                                  
                                                                    
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; padding: 25px 0 15px; ">
                                                                This email comes from an unmonitored box. Do not reply to this email. </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr style="background-color: rgba(244, 244, 244, 1)">
                                <td style="padding: 10px 15px">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                            <tr>
                                                <td
                                                    style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; font-weight: bold; text-align: center; padding: 0 0 5px; ">
                                                    Thanks </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; text-align: center; ">
                                                    KLG Team </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                        </table>
                        </td>
                        </tr>
                        </tbody>
                        </table>`;
      const html = message;
      /**if no country found then send mail to admin */
      if (managers.length === 0)
        mail.generateMail(
          process.env.ADMIN_EMAIL,
          subject.MANAGER_NOT_FOUND,
          html
        );
      /**if country found */
      if (managers.length > 0) {
        /**finding the manager which have same state as member */
        const managerHaveSameStatesAsMember = managers.filter((m) => {
          /**parse the stringigy json to json */
          const states = JSON.parse(m.states);
          /**check the member state and assign manager states are same */
          const s = states.filter((s) => s == data.state);
          if (s.length > 0) {
            /**if same then return manager id */
            return m.userId;
          }
        });
        if (managerHaveSameStatesAsMember.length > 0) {
          /**object of assign manager */
          const assign = {};
          assign.assignedTo = newUser.id;
          assign.assignedToUserRole = 5;
          assign.assignedManager = managerHaveSameStatesAsMember[0].userId;
          /**assigning the manager to member */
          const assigningManager = await memberAssignedManager.create(assign);
          // console.log(assigningManager);
        } else {
          /**if no manager found for assigning the member then send mail to admin */
          mail.generateMail(
            process.env.ADMIN_EMAIL,
            subject.MANAGER_NOT_FOUND,
            html
          );
        }
      }
      // Generate and storing an access token
      const token = crypto.randomBytes(32).toString("hex");
      const user = {};
      user.verificationToken = token;
      const addToken = await usersModel.update(user, {
        where: {
          id: newUser.id,
        },
      });
      /** set default role sign user to 5 */
      const roleData = {};
      roleData.userId = newUser.id;
      roleData.roleId = 5;
      const addRole = await userHaveRolesModel.create(roleData);
      /** set default document permission level to 1 */
      const documentLevel = {};
      documentLevel.userId = newUser.id;
      documentLevel.level = 1;
      documentLevel.levelName = "level 1";
      await modelsDocumentPermission.create(documentLevel);

      const mail_verification_url =
        process.env.CLIENT_URL + "/verify-account/" + token;
      // Read the html for send the mail
      const templateHtml =
        '<table width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="background-color:#f4f4f4;"><td style="padding:20px 15px;text-align:center;"><a href=""><img src="https://klgreact.csdevhub.com/assets/logo.png" width="150" height="44" alt=""></a></td></tr><tr><td style="padding: 35px 15px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size:22px;font-family:Arial, sans-serif;font-weight:bold;padding:0 0 20px 0">Final Step...</td></tr><tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;">Follow this link to verify your email address.</td></tr><tr><td style="padding:20px 0;"><a href="' +
        mail_verification_url +
        '"><img src="https://klgreact.csdevhub.com/assets/confirm_now.png" alt=""></a></td></tr><tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;">If you didn’t ask to verify this address, you can ignore this email.</td></tr></table></td></tr><tr style="background-color:#f4f4f4"><td style="padding:10px 15px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;font-weight:bold;text-align:center;padding:0 0 5px 0">Thanks</td></tr> <tr><td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;text-align:center;">KLG Team</td></tr></table></td></tr></table></td></tr></table>';
      // const templateHtml =
      //   '<table role="presentation" style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);"><tbody><tr><td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;"><table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;"><tbody><tr><td style="padding: 40px 0px 0px;"><div style="text-align: left;"><div style="padding-bottom: 20px;"><img src="https://i.ibb.co/Qbnj4mz/logo.png" alt="Company" style="width: 56px;"></div></div> <div style="padding: 20px; background-color: rgb(255, 255, 255);"><div style="color: rgb(0, 0, 0); text-align: left;"><h1 style="margin: 1rem 0">Final step...</h1><p style="padding-bottom: 16px">Follow this link to verify your email address.</p><p style="padding-bottom: 16px"><a href="' +
      //   mail_verification_url +
      //   '" target="_blank" style="padding: 12px 24px; border-radius: 4px; color: #FFF; background: #2B52F5;display: inline-block;margin: 0.5rem 0;">Confirm now</a></p><p style="padding-bottom: 16px">If you didn’t ask to verify this address, you can ignore this email.</p><p style="padding-bottom: 16px">Thanks,<br>KLG team</p></div></div> <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;"><p style="padding-bottom: 16px">Made with Klg</p></div></td></tr></tbody></table></td></tr></tbody></table>';

      mail.generateMail(
        newUser.email,
        subject.EMAIL_VERIFICATION,
        templateHtml
      );

      // User created successfully, send a success response
      return res
        .status(201)
        .json({ message: "User Created Successfully", user: newUser });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
      return res.status(500).json({
        message: "There is an error while registration. Please try again later",
      });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    const tokenData = {};
    try {
      /* Check if the email already exists in the database */
      const existingUser = await usersModel.findOne({
        where: { email: email, isVerified: true, status: 1 },
        include: rolesModel,
      });
      if (!existingUser) {
        return res
          .status(201)
          .json({ message: "This email is not registered or verified." });
      }

      /* Compare the provided password with the hashed password in the database */
      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!passwordMatch) {
        return res.status(202).json({ message: "Invalid useremail/password" });
      }

      // Capture the login time in of member
      if (existingUser.roles[0].id === 5) {
        const currentDate = new Date();

        // Get the date in "YYYY-MM-DD" format
        const formattedDate = currentDate.toISOString().split("T")[0];
        // Get the time in "HH:mm:ss" format
        const formattedTime = currentDate
          .toISOString()
          .split("T")[1]
          .split(".")[0];

        const timeSpentInfo = await userTimeSpentModel.create({
          userId: existingUser.id,
          date: formattedDate,
          startTime: formattedTime,
        });
        if (timeSpentInfo) {
          tokenData.timeSpentInfo = timeSpentInfo.id;
        }
      }
      /** If the password matches, create a JWT token  */
      tokenData.userId = existingUser.id;
      tokenData.email = existingUser.email;
      tokenData.role = existingUser.roles[0].id;
      const token = jwt.sign(
        tokenData,
        process.env.SECRET_KEY,
        { expiresIn: "1d" } // Token expiration time
      );
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async signOut(req, res) {
    const token = req?.headers?.authorization;
    try {
      if (!token)
        return res.status(400).send("token is required to access the data");

      const tokenInfo = jwt.verify(token, process.env.SECRET_KEY);
      if (tokenInfo.timeSpentInfo) {
        const currentDate = new Date();

        const userTimeSpent = await userTimeSpentModel.findOne({
          where: { id: tokenInfo.timeSpentInfo },
        });
        // Get the time in "HH:mm:ss" format
        const logInTime = userTimeSpent.startTime;
        const logOutTime = currentDate
          .toISOString()
          .split("T")[1]
          .split(".")[0];
        const userSpentTime = helper.timeDifference(logInTime, logOutTime);
        const updatedData = {
          endTime: logOutTime,
          totalTimeSpent: userSpentTime,
        };
        await userTimeSpentModel.update(updatedData, {
          where: {
            id: tokenInfo.timeSpentInfo,
          },
        });
      }
      res.json({ message: " ok" });
    } catch (e) {
      console.error(e);
    }
  }

  async forget_password(req, res) {
    const { email } = req.body;
    try {
      // Check if the email already exists in the database
      const existingUser = await usersModel.findOne({
        where: { email: email },
      });
      if (!existingUser) {
        return res
          .status(201)
          .json({ message: "This Email ID is not registered" });
      }
      // Generate and storing an access token
      const token = crypto.randomBytes(32).toString("hex");
      const user = {};
      user.verificationToken = token;
      const addRole = await usersModel.update(user, {
        where: {
          id: existingUser.id,
        },
      });
      const mail_verification_url =
        process.env.CLIENT_URL + "/reset-password/" + token;
      // Read the html for send the mail
      const templateHtml =
        '<table width="600" cellpadding="0" cellspacing="0" border="0" align="center"> <tr> <td> <table width="100%" cellpadding="0" cellspacing="0" border="0"> <tr style="background-color:#f4f4f4;"> <td style="padding:20px 15px;text-align:center;"><a href=""><img src="https://klgreact.csdevhub.com/assets/logo.png" width="150" height="44" alt=""></a></td> </tr> <tr> <td style="padding: 35px 15px;"> <table width="100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td style="font-size:22px;font-family:Arial, sans-serif;font-weight:bold;padding:0 0 20px 0">Dear '+
        existingUser.username
        + ', </td> </tr> <tr> <td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;padding:0 0 15px 0;">This email confirms that a password reset request was submitted for your KLG account associated with '
        + existingUser.email+
        '.</td> </tr> <tr> <td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;">If you requested this password reset, please click the link below to create a new password.</td> </tr> <tr> <td style="padding:20px 0;"><a href="'
        + mail_verification_url +
        '" style="padding: 12px 24px; border-radius: 4px; color: #FFF; background: #2B52F5;display: inline-block;margin: 0.5rem 0;">Reset Password</a></td> </tr> <tr> <td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;">If you did not request a password reset, please ignore this email.</td> </tr> </table> </td> </tr> <tr style="background-color:#f4f4f4"> <td style="padding:10px 15px;"> <table width="100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;font-weight:bold;text-align:center;padding:0 0 5px 0">Thanks</td> </tr> <tr> <td style="font-size:15px;font-family:Arial, sans-serif;line-height:20px;text-align:center;">KLG Team</td> </tr> </table> </td> </tr> </table> </td> </tr></table>';
      // const templateHtml="test";
      // Generate the sender link for verify the register email address.
      const mail = new Mail();
      mail.generateMail(
        existingUser.email,
        subject.RESET_PASSWORD,
        templateHtml
      );
      res
        .status(200)
        .json({ message: "password reset link sent through email" });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async resetPassword(req, res) {
    try {
      const token = req.params.token;
      const data = req.body;
      const checkToken = await usersModel.findOne({
        where: {
          verificationToken: token,
        },
      });
      if (!checkToken)
        return res.status(203).send({ message: "token is not found" });
      const salt = await bcrypt.genSaltSync(10, "a");
      data.password = bcrypt.hashSync(data.password, salt);
      const updatePassword = await usersModel.update(data, {
        where: {
          verificationToken: token,
        },
      });
      return res.send({ message: "passowrd is updated" });
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  /* add new user */
  async addUser(req, res) {
    try {
      const data = req.body;
      /* checking that is user exists or not  */
      const userExists = await usersModel.findOne({
        where: {
          email: data.email,
        },
      });
      /* if exixts then return  */
      if (userExists)
        return res.send({ message: "User with this email already exists" });
      /* if not then create user */
      const createUser = await usersModel.create(data);
      /* adding user role */
      const roleData = {};
      roleData.userId = createUser.id;
      roleData.roleId = data.roleId;
      const addRole = await userHaveRolesModel.create(roleData);
      /** send the response */
      res.send({
        message: "User Created Successfully",
        createdUser: createUser,
      });
    } catch (e) {
      console.log(e);
      res.send({ message: "error occure while processing the request" });
    }
  }

  async getUserByRole(req, res) {
    try {
      const adminData = await rolesModel.findAll({
        where: {
          id: this.roleId,
        },
        include: usersModel,
      });
      res.send({ data: adminData });
    } catch (e) {
      res.send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  /** get single user in formation  */
  async getSingleUser(req, res) {
    try {
      const userId = req.params.id;
      const singleUser = await usersModel.findOne({
        attributes: { exclude: "password" },

        where: {
          id: userId,
        },
        include: rolesModel,
      });
      res.status(200).send({ user: singleUser });
    } catch (e) {
      res.send({ message: "error occure while processing the request" });
    }
  }

  /* delete the user */
  async deleteUser(req, res) {
    // activity.
    try {
      /**get user id from param  */
      const userId = req.params.id;
      const deleteUser = await usersModel.destroy({
        where: {
          id: userId,
        },
      });
      res.send({ message: "User Deleted Successfully" });
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async updateprofileImage(req, res) {
    try {
      console.log(req.file);

      const userId = req.user.userId;
      if (req.file) {
        const filepath =
          `${process.env.SITE_URL}${process.env.USERS_PROFILE_PATH}/` +
          req.file.originalname;
        const updateProfile = await usersModel.update(
          { profile_pic: filepath },
          {
            where: {
              id: userId,
            },
          }
        );
        console.log("updateProfile", updateProfile);
      }
      if (req.body.profile_pic) {
        // Remove the "/assets/avatar" prefix
        const avatarPath = req.body.profile_pic.replace("/assets/avatar", "");

        // Create a full URL based on SITE_URL and the avatarPath
        const filepath = `${process.env.SITE_URL}${process.env.USERS_PROFILE_PATH}${avatarPath}`;

        // Update the user's profile_pic with the full URL
        const updateProfile = await usersModel.update(
          { profile_pic: filepath },
          {
            where: {
              id: userId,
            },
          }
        );
      }

      res.send({ message: "User Updated Successfully" });
    } catch (e) {
      console.log(e);
    }
  }

  /* updating the user */
  async updateUser(req, res) {
    activity.name = "updating the user";
    try {
      const error = validationResult(req);
      if (!error.isEmpty())
        return res
          .status(220)
          .send({ error: error.array(), message: "all fields are required" });
      let userId;
      if (!req.params.id) {
        userId = req.user.userId;
      } else {
        userId = req.params.id;
      }
      const data = req.body;
      if (req.file) {
        const filepath =
          `${process.env.SITE_URL}${process.env.USERS_PROFILE_PATH}/` +
          req.file.originalname;
        data.profile_pic = filepath;
      }
      if (data.password) {
        const salt = await bcrypt.genSaltSync(10, "a");
        data.password = bcrypt.hashSync(data.password, salt);
      }
      if (data.password == "") delete data.password;
      const emailExists = await usersModel.findAll({
        where: {
          email: data.email,
          id: userId,
        },
      });
      if (emailExists.length == 0) {
        const emailExists = await usersModel.findOne({
          where: {
            email: data.email,
          },
        });
        if (emailExists)
          return res
            .status(210)
            .send({ message: "User with this email already exists" });
      }
      data.username = data.email;

      const updateUser = await usersModel.update(data, {
        where: {
          id: userId,
        },
      });

      switch (this?.roleId) {
        case 3 /**if updating the user details of role manager */:
          /**object of assigned states */
          const assignStates = {};
          /** add user ID */
          assignStates.userId = userId;
          /**add assigned country */
          assignStates.country = data.assignedCountry;
          /**add assigned states and convert in to stringify */
          assignStates.states = JSON.stringify(data.assignedStates);
          /**checking the manager have already assigned states */
          let existsStates = await managerAssignedStatesModel.findOne({
            where: { userId: userId },
          });
          if (existsStates) {
            /**if exists then update the states */
            const updateStates = await managerAssignedStatesModel.update(
              assignStates,
              { where: { userId: userId } }
            );
          } else {
            /**if not exists then assigned them */
            const addStates = await managerAssignedStatesModel.create(
              assignStates
            );
          }
          break;
        case 5:
          if (data.level) {
            const documentLevel = {};
            documentLevel.userId = userId;
            documentLevel.level = data.level;
            documentLevel.levelName = data.level == 1 ? "level 1" : "level 2";
            const permissionExists = await modelsDocumentPermission.findOne({
              where: {
                userId: userId,
              },
            });
            if (permissionExists) {
              await modelsDocumentPermission.update(documentLevel, {
                where: { userId: userId },
              });
            } else {
              await modelsDocumentPermission.create(documentLevel);
            }
          }
          break;
      }
      /**if manager is presents in req body to assign the member or content contributor */
      if (data.manager) {
        const assign = {};
        assign.assignedBy = req.user.userId;
        assign.assignedTo = userId;
        assign.assignedToUserRole = this.roleId;
        assign.assignedManager = data.manager;
        let existsLink;
        switch (this?.roleId) {
          case 4 /**if updating the user details of role content contributor */:
            existsLink = await assignManager.findOne({
              where: {
                assignedTo: userId,
              },
            });
            if (existsLink) {
              const assigningManager = await assignManager.update(assign, {
                where: { assignedTo: userId },
              });
            } else {
              const assigningManager = await assignManager.create(assign);
            }
            break;
          case 5 /**if updating the user details of role member */:
            existsLink = await memberAssignedManager.findOne({
              where: {
                assignedTo: userId,
              },
            });
            if (existsLink) {
              const assigningManager = await memberAssignedManager.update(
                assign,
                { where: { assignedTo: userId } }
              );
            } else {
              const assigningManager = await memberAssignedManager.create(
                assign
              );
            }
            break;
        }
      }
      if (data.permission) {
        const permissionId = {};
        permissionId.permissionId = data.permission;
        permissionId.userId = userId;
        const managerHavepermission = await managerHavePermissions.findOne({
          where: {
            userId: userId,
          },
        });
        if (managerHavepermission) {
          const managersPermission = await managerHavePermissions.update(
            permissionId,
            { where: { userId: userId } }
          );
        } else {
          const managersPermission = await managerHavePermissions.create(
            permissionId
          );
        }
      }

      res.send({ message: "User Updated Successfully",updatedData:updateUser});
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  /**get user by role */
  async userByRole(req, res) {
    const users = this.roleId ? usersRole[this.roleId] : "All user";
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = `Get users listing`;
    try {
      let user;
      const qString = req.query;
      qString.email = qString.email ? qString.email : "";
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
      const { limit, offset } = helper.getPagination(
        qString.page,
        qString.size
      );
      const sort = helper.getSortingUsers(qString);
      /**  breaking the sequelize query  */
      const where = {};
      const or = [];
      /**breaking the include in the base role */
      /** taking two includes for queries to not conflicting with each other ,one for data query and second for count query */
      let include = [];
      /**include for count  */
      let countInclude = [];
      if (qString.email)
        or.push({ email: { [Op.like]: `%${qString.email}%` } });
      if (qString.username)
        or.push({ username: { [Op.like]: `%${qString.username}%` } });
      if (qString.firstName)
        or.push({ firstName: { [Op.like]: `%${qString.firstName}%` } });
      if (qString.lastName)
        or.push({ lastName: { [Op.like]: `%${qString.lastName}%` } });
      if (qString.address)
        or.push({ address: { [Op.like]: `%${qString.address}%` } });
      if (qString.country)
        or.push({ country: { [Op.like]: `%${qString.country}%` } });
      if (qString.state)
        or.push({ state: { [Op.like]: `%${qString.state}%` } });
      if (qString.city) or.push({ city: { [Op.like]: `%${qString.city}%` } });
      if (qString.zipcode)
        or.push({ zipcode: { [Op.like]: `%${qString.zipcode}%` } });
      if (qString.phone)
        or.push({ phone: { [Op.like]: `%${qString.phone}%` } });
      if (qString.company)
        or.push({ company: { [Op.like]: `%${qString.company}%` } });
      // Sequelize.where(Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')), {
      //     like: '% John Doe %'
      //   })
      // if(qString.manager) managerWhereOr.push({ lastName: { [Op.like]: `%${qString.manager}%` } })
      if (qString.documentLevel) {
        or.push({
          "$models_document_permission.levelName$": {
            [Op.like]: `%${qString.documentLevel}%`,
          },
        });
      }
      if (this.roleId) {
        include.push({
          model: rolesModel,
          attributes: [],
          where: { id: this.roleId },
        });
      }
      /** */
      switch (this.roleId) {
        /** for member listing */
        case 5 /**including the user model */:
          if (qString.manager)
            or.push({
              "$member_manager.username$": {
                [Op.like]: `%${qString.manager}%`,
              },
            });
          include.push({
            model: usersModel,
            attributes: ["id", "username", "firstName", "lastName", "email"],
            as: "member_manager",
          });
          /** including document permission model */
          include.push({
            model: modelsDocumentPermission,
            attributes: ["level", "levelName"],
            required: true,
          });
          break;
        /** for content contributor listing */
        case 4:
          if (qString.manager)
            or.push({
              "$manager.username$": {
                [Op.like]: `%${qString.manager}%`,
              },
            });
          /**including the user model */
          include.push({
            model: usersModel,
            attributes: ["id", "username", "firstName", "lastName", "email"],
            as: "manager",
          });
          break;
      }

      /**if manager is accessing this listing of member and content contributor */
      if (req.user.role === 3) {
        include = [];
        include.push({ model: rolesModel, where: { id: this.roleId } });
        /** if content contributor role in parameter */
        if (this.roleId === 4) {
          /** */
          include.push({
            model: usersModel,
            attributes: ["id", "username", "firstName", "lastName", "email"],
            where: { id: req.user.userId },
            as: "manager",
          });
          countInclude.push({
            model: usersModel,
            attributes: [],
            where: { id: req.user.userId },
            as: "manager",
          });
          include.push({
            model: modelsDocumentPermission,
            attributes: ["level", "levelName"],
          });
        }
        /** if member role in parameter*/
        if (this.roleId === 5) {
          include.push({
            model: usersModel,
            attributes: ["id", "username", "firstName", "lastName", "email"],
            where: { id: req.user.userId },
            as: "member_manager",
          });
          countInclude.push({
            model: usersModel,
            attributes: [],
            where: { id: req.user.userId },
            as: "member_manager",
          });
          /** including document permission model */
          include.push({
            model: modelsDocumentPermission,
            attributes: ["level", "levelName"],
          });
        }
      }
      /* roleId is defined then send data by role */
      if (this.roleId) {
        if (or.length > 0) where[Op.or] = or;
        /** get all user according role */
        user = await usersModel.findAll({
          attributes: { exclude: "password" },
          order: [sort],
          where: where,
          include: include,
        });
      } /* else send all use data */ else {
        /** get all user  */
        user = await usersModel.findAll({
          attributes: { exclude: "password" },
          order: [sort],
          where: where,
          // limit: limit,
          // offset: offset,
        });
      }
      include = [];
      if (this.roleId)
        include.push({ model: rolesModel, where: { id: this.roleId } });
      /** in case to get all user by role */
      if (qString.all)
        user = await usersModel.findAll({
          attributes: { exclude: "password" },
          include: include,
        });
      return res.send({ data: user });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `User getting  lists of all ${users}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /* add new user by role */
  async addUserByRole(req, res) {
    /**creating object for capturing the user activity */
    activity.req = req;
    activity.type = activityTypes.INFO;
    activity.name = "Creating new user";
    try {
      const data = req.body;
      data.username = data.email;
      data.isVerified = true;
      /* checking that is user exists or not  */
      const userExists = await usersModel.findOne({
        where: {
          email: data.email,
        },
      });
      /* if exists then return  */
      if (userExists)
        return res
          .status(201)
          .send({ message: "User with this email already exists" });
      /* check username is exists or not */
      /* if not then create user */
      const createUser = await usersModel.create(data);
      /* adding user role */
      const roleData = {};
      roleData.userId = createUser.id;
      roleData.roleId = this.roleId;
      const addRole = await userHaveRolesModel.create(roleData);
      if (data.manager) {
        const assign = {};
        assign.assignedBy = req.user.userId;
        assign.assignedTo = createUser.id;
        assign.assignedToUserRole = this.roleId;
        assign.assignedManager = data.manager;
        if (this.roleId === 5) {
          const assigningManager = await memberAssignedManager.create(assign);
        } else if (this.roleId === 4) {
          const assigningManager = await assignManager.create(assign);
        }
      }

      if (data.permission) {
        const permissionId = {};
        permissionId.permissionId = data.permission;
        permissionId.userId = createUser.id;
        const managersPermission = await managerHavePermissions.create(
          permissionId
        );
      }

      /** if role is 5 then default document level to 1 */
      if (this.roleId === 5) {
        const documentLevel = {};
        documentLevel.userId = createUser.id;
        documentLevel.level = 1;
        documentLevel.levelName = "level 1";
        await modelsDocumentPermission.create(documentLevel);
      }
      /**add the activity */
      /**adding the decription of activity */
      activity.description = `New user created , email:${data.email}`;
      const addActivity = await addUserActivity(activity);

      /** send the response */
      res.send({
        message: "User Created Successfully",
        createdUser: createUser,
      });
    } catch (e) {
      console.log(e);
      /**activity  type */
      activity.type = activityTypes.ERROR;
      /**activity error */
      activity.error = e.stack;
      /**activity description */
      activity.description = `error occure while the creating new user error : ${e}`;
      /**add the activity */
      addUserActivity(activity);
      res.send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /* get single user details by role and id */
  async getSingleUserByRole(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Get single user details";
    try {
      const userId = req.params.id;
      const include = [];
      include.push({ model: rolesModel, where: { id: this.roleId } });
      /** include according to the roles */
      switch (this.roleId) {
        case 5:
          include.push({ model: usersModel, as: "member_manager" });
          include.push({ model: modelsDocumentPermission });
          break;
        case 4:
          include.push({ model: usersModel, as: "manager" });
          break;
        case 3:
          include.push({
            model: managerHavePermissions,
            include: PermissionsModel,
          });
          include.push({
            model: managerAssignedStatesModel,
            attributes: ["country", "states"],
          });
          break;
      }
      const singleUser = await usersModel.findOne({
        attributes: { exclude: "password" },
        where: {
          id: userId,
        },
        include: include,
      });

      switch (this.roleId) {
        case 3:
          if (singleUser?.manager_assigned_state?.states) {
            singleUser.manager_assigned_state.states = JSON.parse(
              singleUser?.manager_assigned_state?.states
            );
          }
          break;
      }
      res.status(200).send({ user: singleUser });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting the single user details of ${
        usersRole[this.roleId]
      }`;
      /**add user activity */
      addUserActivity(activity);
      console.error(e);
      res.send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /**active and unactive the user */
  async activeUnactiveUser(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Updating the user status";
    try {
      const userId = req.params.id;
      const data = req.body;
      const user = await usersModel.update(data, {
        where: {
          id: userId,
        },
      });
      const userDetails = await usersModel.findOne({ where: { id: userId } });
      const status = data.status ? "enabale" : "disable";
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User Updated the status of ${userDetails.email} to ${status}`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "user status updated" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while updating the user status`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async verifyAccount(req, res) {
    try {
      const token = req.params.token;
      // Define the update values and the conditions
      const updateValues = {
        isVerified: true,
        // Other fields you want to update
      };
      const conditions = {
        verificationToken: token,
        // Your condition to identify the record(s) to update
      };
      // Perform the update
      const verifyToken = await usersModel.update(updateValues, {
        where: conditions,
      });
      if (verifyToken[0] === 0)
        return res.status(203).send({ message: "Token not exist in record." });
      res.send({ message: "Token Verified Successfully" });

      // .then(([rowsUpdated]) => {
      //     if (rowsUpdated > 0) {
      //         console.log('Token verified');
      //         var msg = 'Token verified successfully';

      //     } else {
      //         console.log('Token not exist in record.');
      //         var msg = 'Token not exist in record.';
      //     }

      // }).catch(error => {
      //     console.error('Error verifying user:', error);
      //     res.send({message:response})
      // });
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /**controller for bulk opertaion  */
  async bulkOperation(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Users bulk operation";
    try {
      const data = req.body;
      let action;
      switch(data?.action){
        case "delete" : 
          action = await usersModel.destroy({
            where: { id: { [Op.in]: data.id } },
          });
        break;
        case "enable" :
          action = await usersModel.update(
            { status: true },
            { where: { id: { [Op.in]: data.id } } }
          );
        break;
        case "disable" :
          action = await usersModel.update(
            { status: false },
            { where: { id: { [Op.in]: data.id } } }
          );
        break;
        default:
          return res.send({message:"only enable, disable and delete parameter allowed"})
        break;
      }
      // if (data.action == "delete")
      //   action = await usersModel.destroy({
      //     where: { id: { [Op.in]: data.id } },
      //   });
      // if (data.action == "enable")
      //   action = await usersModel.update(
      //     { status: true },
      //     { where: { id: { [Op.in]: data.id } } }
      //   );
      // if (data.action == "disable")
      //   action = await usersModel.update(
      //     { status: false },
      //     { where: { id: { [Op.in]: data.id } } }
      //   );
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User ${data.action}d the resources, resource ids: ${data.id}`;
      /**add user activity */
     await  addUserActivity(activity);
     res.send({ message: `selected users are ${data.action}d` ,[data?.action]:action});
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user performing the bulk operation in users,action: ${req.body.action} resource ids ${req.body.id}, error: ${e}`;
      /**add user activity */
      await addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /**get  the requests of level 2 document access*/
  async levelTwoDocumentAccessRequests(req, res) {
    try {
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
      const { limit, offset } = helper.getPagination(
        qString.page,
        qString.size
      );
      let documentRequests = await documentAccessRequestModel.findAndCountAll({
        where: {
          actionTakenBy: { [Op.is]: null },
        },
        include: [
          {
            model: usersModel,
            attributes: [
              "firstName",
              "lastName",
              "email",
              "address",
              "company",
            ],
          },
          {
            model: resourcesModel,
            attributes: ["documentName", "level", "resourceName"],
          },
        ],
        limit: limit,
        offset: offset,
      });
      documentRequests = helper.getPaginationData(
        documentRequests,
        qString.page,
        limit
      );
      return res.send(documentRequests);
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /** accept and reject the level 2  document requests */
  async acceptRejectLevelTwoDocumentRequests(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Member level 2 document request ";
    const data = req.body;
    try {
      const documentRequests = {};
      documentRequests.actionTakenBy = req.user.userId;
      const mail = new Mail();
      const userDetails = await usersModel.findOne({
        where: {
          id: data.userId,
        },
      });

      switch (data.action) {
        case "Declined":
          /**add activity description */
          activity.description = `User declined the member level 2 documents request, user email :${userDetails.email}`;
          documentRequests.approvalStatus = false;
          const rejectionMessage = `This email is to inform you that your request for
                                    access to document level 2 is has been declined`;
          const rejectTemplate = htmlTemplate(rejectionMessage);
          const mailsend = await mail.generateMail(
            userDetails.email,
            subject.DOCUMENT_DECLINED_REQUEST,
            rejectTemplate
          );
          break;
        case "Accepted":
          /**add activity description */
          activity.description = `User accepted the member level 2 documents request, , user email :${userDetails.email}`;
          documentRequests.approvalStatus = true;
          const documentLevel = {};
          documentLevel.userId = data.userId;
          documentLevel.level = data.requestedLevel;
          documentLevel.levelName =
            data.requestedLevel === 1 ? "level 1" : "level 2";
          const permissionExists = modelsDocumentPermission.findOne({
            where: {
              userId: data.userId,
            },
          });
          if (permissionExists) {
            await modelsDocumentPermission.update(documentLevel, {
              where: { userId: data.userId },
            });
          } else {
            await modelsDocumentPermission.create(documentLevel);
          }
          const acceptedTemplate = `<table width="600" cellpadding="0" cellspacing="0" border="0" align="center" > <tbody> <tr> <td> <table width="100%" cellpadding="0" cellspacing="0" border="0"> <tbody> <tr style="background-color: rgba(244, 244, 244, 1)"> <td style="padding: 20px 15px; text-align: center"> <a href="" ><img src="https://klgreact.csdevhub.com/assets/logo.png" width="150" height="44" alt="" />
            </a> </td> </tr> <tr> <td style="padding: 35px 15px"> <table width="100%" cellpadding="0" cellspacing="0" border="0" > <tbody> <tr> <td style=" font-size: 22px; font-family: Arial, sans-serif; font-weight: bold; padding: 0 0 20px; " > 
            Dear `+userDetails.username + `, </td> </tr> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; padding: 0 0 20px;" >We are thrilled to inform you that your request for Level 2 access has been approved! </td> </tr> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; " >This means you now have access to exclusive Level 2 documents and features, including: <ul> <li>Download the Level 2 documents.</li> </ul> </td> </tr> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; padding: 25px 0 15px; " > If you have any questions or need assistance, please don't hesitate to contact us.</td> </tr> </tbody> </table> </td> </tr> <tr style="background-color: rgba(244, 244, 244, 1)"> <td style="padding: 10px 15px"> <table width="100%" cellpadding="0" cellspacing="0" border="0" > <tbody> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; font-weight: bold; text-align: center; padding: 0 0 5px; " > Thanks </td> </tr> <tr> <td style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; text-align: center; " > KLG Team </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody></table>`;

          await mail.generateMail(
            userDetails.email,
            subject.DOCUMENT_ACCEPT_REQUEST,
            acceptedTemplate
          );

          break;
        default:
          return res.status(210).send({
            message: "In Action Only Accept And Decline Parameter Allowed",
          });
      }
      await documentAccessRequestModel.update(documentRequests, {
        where: { id: data.id },
      });
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add user activity */
      addUserActivity(activity);

      res.send({ message: `User Request ${data.action}` });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user ${data.action} the member level 2 documents request, user id :${data.userId}, error: ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /**get all Managers for drop down in  */
  async getAllManager(req, res) {
    try {
      const managers = await usersModel.findAll({
        include: { model: rolesModel, where: { id: 3 } },
      });
      res.send(managers);
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /**get logged in user details */
  async getSingleLoggedInUserDetails(req, res) {
    try {
      const user = req.user;
      const userDetails = await usersModel.findOne({
        where: { id: user.userId },
        attributes: { exclude: "password" },
      });
      res.send(userDetails);
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /** */
  async updateSingleLoggedInUserDetails(req, res) {
    try {
      const user = req.user;
      const data = req.body;
      console.log("data", data);
      // req.params.id = req.user.userId
      // this.updateUser(req,res)
      const updateUser = await usersModel.update(data, {
        where: { id: user.userId },
      });
      res.send({ message: "Your Profile Details Updated" });
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /* to fetch the permissions for the managers */
  async getPermissions(req, res) {
    try {
      const permissions = await PermissionsModel.findAll();
      res.send(permissions);
    } catch (e) {
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /** send level 2 permissions  */
  async sendLevel2PermissionRequest(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Send level 2 permission";
    try {
      const user = req.user;
      const currentUser = usersModel.findOne({ where: { id: user.userId } });
      const data = req.body;
      const requestData = {};
      requestData.userId = user.userId;
      requestData.requestedLevel = "2";
      requestData.documentId = data.resourceId;
      /**check user already  sent request */
      const check = {
        userId: user.userId,
        actionTakenBy: null,
        approvalStatus: null,
      };
      const request = await documentAccessRequestModel.findOne({
        where: check,
      });
      if (request)
        return res.send({ message: "You Already Sent Request for Access" });
      const createRequest = await documentAccessRequestModel.create(
        requestData
      );
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User send the level 2 permission request to access the level 2 documents`;
      /**add user activity */
      addUserActivity(activity);
      return res.send({ message: "Request Send Successfuly" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while sending the level 2 permission request to access the level 2 documents, Error : ${e}`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  // For the contact form
  async ContactformAdd(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "Contact us form";
    try {
      const data = req.body;
      const user = req.user;
      console.log("data", data);
      // return res.send(data);
      /* Generate the sender link for verify the register email address.*/
      const formDetails = `<table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
      <tbody>
          <tr>
              <td>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tbody>
                          <tr style="background-color: rgba(244, 244, 244, 1)">
                              <td style="padding: 20px 15px; text-align: center"> <a href=""><img
                                          src="https://klgreact.csdevhub.com/assets/logo2.png" width="150" height="44"
                                          alt="" /></a> </td>
                          </tr>
                          <tr>
                              <td style="padding: 35px 15px">
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                      <tr>
                                          <td
                                              style=" font-size: 22px; font-family: Arial, sans-serif; font-weight: bold; padding: 0 0 20px; ">
                                              Greetings, </td>
                                      </tr>
                                      <tr>
                                          <td>
                                              <table cellpadding="10" cellspacing="0" border="1" style="border-collapse: collapse;" width="100%">
                                                  <tr>
                                                      <td>Name</td>
                                                      <td>${data.name}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>Email</td>
                                                      <td>${data.email}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>Phone</td>
                                                      <td>${data.phone}</td>
                                                  </tr>
                                                  <tr>
                                                      <td>Comments</td>
                                                      <td>${data.comment}</td>
                                                  </tr>
                                                  
                                              </table>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td
                                              style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; padding: 25px 0 15px; ">
                                              This email comes from an unmonitored box. Do not reply to this email. </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </td>
          </tr>
          <tr style="background-color: rgba(244, 244, 244, 1)">
              <td style="padding: 10px 15px">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tbody>
                          <tr>
                              <td
                                  style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; font-weight: bold; text-align: center; padding: 0 0 5px; ">
                                  Thanks </td>
                          </tr>
                          <tr>
                              <td
                                  style=" font-size: 15px; font-family: Arial, sans-serif; line-height: 20px; text-align: center; ">
                                  KLG Team </td>
                          </tr>
                      </tbody>
                  </table>
              </td>
          </tr>
      </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
                          `;
      const html =formDetails;
      const mail = new Mail();
      switch (data?.subject) {
        case "technicalIssue":
          const Admins = await usersModel.findAll({
            attributes: ["email"],
            include: {
              model: rolesModel,
              where: { id: { [Op.in]: [1, 2, 3] } },
            },
          });
          const AdminEmails = Admins.map((s) => s.email);
          mail.generateMail(AdminEmails, subject.CONTACT_US, html);
          break;
        case "general":
          const manager = await usersModel.findOne({
            where: { id: user.userId },
            include: {
              model: usersModel,
              as: "member_manager",
              attributes: ["email"],
            },
          });
          mail.generateMail(
            manager.member_manager[0].email,
            subject.CONTACT_US,
            html
          );
          break;
        default:
          return res.send({
            message:
              "only general and technicalIssue value is accepted in subject",
          });
          break;
      }
      const details = await ContactModal.create(data);
      /**activity type */
      activity.type = activityTypes.INFO;
      /**add activity description */
      activity.description = `User fill the contact us form`;
      /**add user activity */
      addUserActivity(activity);
      res.send({ message: "Thankyou For contacting Us" });
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while User filling the contact us form`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }
  /**get the  manager details of logged  in member */
  async GetMyManagerDetails(req, res) {
    /**sending req */
    activity.req = req;
    /** activity name */
    activity.name = "My manager details (GetMyManagerDetails)";
    try {
      const userId = req.user.userId;
      const assign_manager = await memberAssignedManager.findOne({
        where: { assignedTo: userId },
      });
      // console.log(!assign_manager)
      if (!assign_manager)
        return res.status(204).send({ message: "No manager Assign" });
      const manager_details = await usersModel.findOne({
        where: { id: assign_manager.assignedManager },
      });

      res.send(manager_details);
    } catch (e) {
      /**activity type */
      activity.type = activityTypes.ERROR;
      /**activity type */
      activity.error = e.stack;
      /**add activity description */
      activity.description = `Error occure while user getting his manager details`;
      /**add user activity */
      addUserActivity(activity);
      console.log(e);
      return res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async ChangeMemberPassword(req, res) {
    try {
      /**get user id of logged in user */
      const userId = req.user.userId;
      const data = req.body;
      const userdetails = await usersModel.findOne({ where: { id: userId } });
      const oldpassVerification = bcrypt.compareSync(
        req.body.oldPassword,
        userdetails.password
      );
      if (oldpassVerification == true) {
        const salt = await bcrypt.genSaltSync(10, "a");
        const password = bcrypt.hashSync(req.body.newPassword, salt);
        const updatedPassword = await usersModel.update(
          { password: password },
          { where: { id: userId } }
        );
        console.log(updatedPassword);
        return res
          .status(200)
          .send({ message: "password is updated successfully" });
      } else {
        return res.status(250).send({ message: "old password didn't matched" });
      }

      // const assign_manager = await memberAssignedManager.findOne( {where : {assignedTo : userId}} )
      // const manager_details = await usersModel.findOne({ where: {id : assign_manager.assignedManager}})
      // console.log(manager_details);
      // res.send(manager_details)
    } catch (e) {
      console.log(e);
      return res.status(250).send({
        message: "error occure while processing the request",
        error: e,
      });
    }
  }

  async userActivityLogs(req, res) {
    try {
      const qString = req.query;
      const where = {};
      const or = [];
      const and = [];
      if (qString.search) {
        or.push({ activityName: { [Op.like]: `%${qString.search}%` } });
        or.push({ description: { [Op.like]: `%${qString.search}%` } });
        or.push({ activityType: { [Op.like]: `%${qString.search}%` } });
        or.push({ takenBy: { [Op.like]: `%${qString.search}%` } });
        or.push({ takenByRole: { [Op.like]: `%${qString.search}%` } });
        or.push({ error: { [Op.like]: `%${qString.search}%` } });
      }
      if (or.length > 0) where[Op.or] = or;
      const order = helper.getSortedUserActivity(qString);
      const userLogs = await userActivityModel.findAll({
        order: [order],
        where: where,
      });
      res.send({ logs: userLogs, activityTypes: activityTypesArray });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .send({ message: "error occure while processing", error: e });
    }
  }
}

module.exports = user;
