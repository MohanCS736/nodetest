const request = require("supertest");
const sequelize = require("../../config/db");
const roles = require("../../models/roles"); // Assuming your Sequelize model is in a separate file
const documentLevels = require("../../models/documentLevels"); // Assuming your Sequelize model is in a separate file
const user = require("../../models/users"); // Assuming your Sequelize model is in a separate file
const userHaveRoles = require("../../models/userHaveRoles");
const assignManager = require("../../models/ContributorAssignedManager");
const memberAssignedManager = require("../../models/MemberAssignedManagers");
const resourcesModel = require("../../models/resources");
const modelsDocumentPermission = require("../../models/modelDocumentPermissions");
const documentAccessRequestModel = require("../../models/documentAccessRequest");
const userTimeSpentModel = require("../../models/userTimeSpent");
const managerHavePermissions = require("../../models/managerHavePermissions");
const ContactModal = require("../../models/contentUS");
const managerAssignedStatesModel = require("../../models/managerAssignedStates");
const permissions = require("../../models/permissions");
const userActivityModel = require('../../models/userActivity') 
const {
  predefinedRoles,
  preDefinedDocumentLevel,
  perMissions,
  users,
  assignRole,
} = require("../../config/databaseData");
const app = require("../../app");
const {
  loginWithCorrectCredentails,
  loginWithWrongEmail,
  loginWithWrongPassword,
  existingMemberSignUp,
  newMemberSignUp,
  loginWithContent,
  loginWithManager,
  loginWithMember,
  loginWithSuperAdmin,
  addNewSuperAdmin,
  addNewManager,
  addNewContentContributor,
  addNewMember,
  updatingNewManager,
  updatingNewMember,
  bulkOperation
} = require("../test");

beforeAll(async () => {
  await sequelize.sync({ alter: true });
  await roles.bulkCreate(predefinedRoles, { ignoreDuplicates: true });
  await documentLevels.bulkCreate(preDefinedDocumentLevel, {
    ignoreDuplicates: true,
  });
  await user.bulkCreate(users, { ignoreDuplicates: true });
  await userHaveRoles.bulkCreate(assignRole, { ignoreDuplicates: true });
   await permissions.bulkCreate(perMissions, { ignoreDuplicates: true });
  
});
afterAll(async () => {
  await sequelize.close();
});
let token;
describe("user", () => {
  describe("sign up", () => {
    describe("email is already exists", () => {
      it("should Email already exists", async () => {
        const res = await request(app)
          .post("/signup")
          .send(existingMemberSignUp);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Email already exists");
      });
    });
    describe("new user signup ", () => {
      it("should User Created Successfully", async () => {
        const res = await request(app).post("/signup").send(newMemberSignUp);
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("User Created Successfully");
      });
    });
  });

  describe("login", () => {
    describe("email not verified, disable or Exists", () => {
      it("should This email is not registered or verified.", async () => {
        const res = await request(app).post("/login").send(loginWithWrongEmail);
        token = res.body.token;
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe(
          "This email is not registered or verified."
        );
      });
    });
    describe("passowrd is wrong", () => {
      it("should Invalid useremail/password", async () => {
        const res = await request(app)
          .post("/login")
          .send(loginWithWrongPassword);
        expect(res.status).toBe(202);
        expect(res.body.message).toBe("Invalid useremail/password");
      });
    });
    describe("email and password both correct", () => {
      it("should login successfuly", async () => {
        const res = await request(app)
          .post("/login")
          .send(loginWithCorrectCredentails);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Login successful");
      });
    });
  });

});
describe("admin",()=>{
  describe("create new user",()=>{
    it("should User with this email already exists",async()=>{
      const login = await request(app).post('/login').send(loginWithCorrectCredentails);
      token = login.body.token
      const res = await request(app).post("/user/admin")
      .send(existingMemberSignUp)
      .set("authorization",token)
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User with this email already exists");
    })
    describe("create new super admin",()=>{
      it("should User Created Successfully",async()=>{
        const res = await request(app).post('/user/admin')
        .send(addNewSuperAdmin)
        .set('authorization',token);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User Created Successfully");
      })
    })
    describe("create new manager",()=>{
      it("should User Created Successfully",async()=>{
        const res = await request(app).post('/user/manager')
        .send(addNewManager)
        .set('authorization',token);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User Created Successfully");
      })
    })
    describe("create new content Contributor",()=>{
      it("should User Created Successfully",async()=>{
        const res = await request(app).post('/user/contentContributor')
        .send(addNewContentContributor)
        .set('authorization',token);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User Created Successfully");
      })
    })
    describe("create new member",()=>{
      it("should User Created Successfully",async()=>{
        const res = await request(app).post('/user/member')
        .send(addNewMember)
        .set('authorization',token);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User Created Successfully");
      })
    })
  })
  describe("updating user",()=>{
    describe('updating the user email with', () => {
      describe("the email is already occupied by other user",()=>{
        it("should User with this email already exists",async()=>{
          // id 7 belongs to new super admin
          const res = await request(app).put('/user/7')
          .send(existingMemberSignUp)
          .set('authorization',token);
          expect(res.statusCode).toBe(210);
          expect(res.body.message).toBe("User with this email already exists")
        });
      })
      describe("updating the user email to updatednewsitesuperadminyopmail.com",()=>{
        it("User Updated Successfully",async()=>{
          const res = await request(app).put('/user/7')
          .send({email:"updatednewsitesuperadminyopmail.com"})
          .set('authorization',token);
          expect(res.statusCode).toBe(200);
          expect(res.body.message).toBe("User Updated Successfully");
        });
      });
    })
    describe("updating the manager assigned country and state",()=>{
      it("User Updated Successfully",async()=>{
        const res = await request(app).put('/user/manager/8')
        .send(updatingNewManager)
        .set('authorization',token);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User Updated Successfully");
      });
    })
    describe("updating the member document access level",()=>{
      it("User Updated Successfully",async()=>{
        // id 10 belongs to new member
        const res = await request(app).put('/user/member/10')
        .send(updatingNewMember)
        .set('authorization',token);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User Updated Successfully");
      });
    })
  })
  describe("get single user",()=>{
    describe('get member',()=>{
      it("should return the member data",async()=>{
        const res = await request(app).get('/user/member/10')
        .set("authorization",token)
        expect(res.statusCode).toBe(200);
        console.log(res.body.user);
        expect(res.body.user.roles[0].id).toBe(5);
        expect(res.body.user.member_manager[0].email).toBe("newmanager@yopmail.com");
        expect(res.body.user.email).toBe("newMember@yopmail.com");
      })
    })
    describe('get content contributor',()=>{
      it("should return the content contributor data",async()=>{
        const res = await request(app).get('/user/contentContributor/9')
        .set("authorization",token)
        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe("newcontentcontributor@yopmail.com");
        expect(res.body.user.roles[0].id).toBe(4);
        expect(res.body.user.manager[0].email).toBe("newmanager@yopmail.com");

      })
    })
    describe('get manager',()=>{
      it("should return the manager data",async()=>{
        const res = await request(app).get('/user/manager/8')
        .set("authorization",token)
        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe("newmanager@yopmail.com");
        expect(res.body.user.roles[0].id).toBe(3);
      })
    })
    describe('get super admin',()=>{
      it("should return the super admin data",async()=>{
        const res = await request(app).get('/user/admin/7')
        .set("authorization",token)
        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe("updatednewsitesuperadminyopmail.com");
        expect(res.body.user.roles[0].id).toBe(2);
      })
    })
  })
  describe("deleting user",()=>{
    it("should User Deleted Successfully",async()=>{
      const res = await request(app).delete('/user/8')
      .set("authorization",token)
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("User Deleted Successfully")
    })
  })
  describe('bulk operation', () => {
    describe("disable selected users",()=>{
      describe("passing anonymous ids",()=>{
        it("should selected users are disabled",async ()=>{
          const res = await request(app).put("/user/bulkOperation")
          .send(bulkOperation.anonymous)
          .set("authorization",token);
          console.log("bulk",res.body)
          expect(res.statusCode).toBe(200)
          expect(res.body.message).toBe("selected users are disabled")
        })
      });
      it("should selected users are disabled",async ()=>{
        const res = await request(app).put("/user/bulkOperation")
        .send(bulkOperation.disable)
        .set("authorization",token);
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe("selected users are disabled")
      })
    })
    describe("enabled selected users",()=>{
      it("should selected users are disabled",async ()=>{
        const res = await request(app).put("/user/bulkOperation")
        .send(bulkOperation.enable)
        .set("authorization",token);
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe("selected users are enabled")
      })
    })
    describe("delete selected users",()=>{
      it("should selected users are deleted",async()=>{
        const res = await request(app).put('/user/bulkOperation')
        .send(bulkOperation.delete)
        .set("authorization",token);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("selected users are deleted")
      })
    })
    describe("enter the wrong action",()=>{
      it("should only enable, disable and delete parameter allowed",async ()=>{
        const res = await request(app).put("/user/bulkOperation")
        .send(bulkOperation.random)
        .set("authorization",token);
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe("only enable, disable and delete parameter allowed")
      })
    })
  })
  // describe('')

})
// newmanager@yopmail.com