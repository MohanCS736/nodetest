const express = require("express");
const router = express.Router();
const user = require("../controllers/user");
const tokenstring = require("../controllers/Authenticator");
const managerController = require("../controllers/managerController");
const { body } = require("express-validator");
const middlewares = require("../middlewares/authenticators/authenticator");
const trainingType = require("../controllers/trainingType");
const resources = require("../controllers/resources");
const addToFavourite = require("../controllers/addToFavourite");
const contactus = require("../models/contentUS");
router.use(
  express.urlencoded({ extended: true })
); /*/ Parse URL-encoded bodies*/
router.use(express.json()); /*/ Parse JSON bodies*/
const uploader = require("../middlewares/uploader/uploader");
const subjectController = require("../controllers/subjectController");

const myInstanceMananger = new managerController();

/**test route */
router.get("/", (req, res) => {
  res.send("server is working");
});

/* for Authentication */
router.post("/token", tokenstring.Authenticator);

router.get("/member/listing", (req, res) => {
  myInstanceMananger.MemberListing(req, res);
});
router.get("/manager/edit/:id", (req, res) => {
  const itemId = req.params.id; // Get the 'id' parameter from the URL

  myInstanceMananger.ManagersEdit(req, res, itemId); // Pass the 'id' parameter to your function
});
router.post("/save/managerprofile", (req, res) => {
  myInstanceMananger.ManagersProfileUpdate(req, res);
});

/** sign up route */
router.route("/signup").get(new user().signup).post(new user().signup);
/** login route */
router
  .route("/login")
  .get(new user().login)
  .post(
    new user().login
  ); /* Add user and only site super admin can add the users */
router.post("/addUser", new user().addUser);
/* delete user */

// Logout route
router.get("/logout", (req, res) => {
  res.json({ message: " ok" });
});

router.get("/sign-out", new user().signOut);

router
  .route("/forgetpassword")
  // .get(new user().forget_password)
  .post(new user().forget_password);
/**reset the password by token */
router.post("/user/resetPassword/:token", new user().resetPassword);
/* get all user */
// Verify registered mail address
router.get("/verify-account/:token", new user().verifyAccount);
/**adding the middle ware for authenticating the routes */
router.use(middlewares.authenticator);

router.get("/user", (req, res) => {
  new user().userByRole(req, res);
});

/*add, get all, single and update user by role */
// router.get('/user/admin',new user({roleId:1}).getUserByRole);
router
  .route("/user/admin")
  .get((req, res) => {
    new user({ roleId: 2 }).userByRole(req, res);
  })
  .post((req, res) => {
    new user({ roleId: 2 }).addUserByRole(req, res);
  });
router
  .route("/user/admin/:id")
  .get((req, res) => {
    new user({ roleId: 2 }).getSingleUserByRole(req, res);
  })
  .put(
    [
      body("firstName").notEmpty().withMessage("firstName is required."),
      body("lastName").notEmpty().withMessage("lastName is required."),
      body("email")
        .notEmpty()
        .withMessage("email is required.")
        .isEmail()
        .withMessage("enter a valid email"),
    ],
    (req, res) => {
      new user({ roleId: 2 }).updateUser(req, res);
    }
  );

router
  .route("/user/manager")
  .get((req, res) => {
    new user({ roleId: 3 }).userByRole(req, res);
  })
  .post((req, res) => {
    new user({ roleId: 3 }).addUserByRole(req, res);
  });
router
  .route("/user/manager/:id")
  .get((req, res) => {
    new user({ roleId: 3 }).getSingleUserByRole(req, res);
  })
  .put((req, res) => {
    new user({ roleId: 3 }).updateUser(req, res);
  });

router
  .route("/user/contentContributor")
  .get((req, res) => {
    new user({ roleId: 4 }).userByRole(req, res);
  })
  .post((req, res) => {
    new user({ roleId: 4 }).addUserByRole(req, res);
  });

router
  .route("/user/contentContributor/:id")
  .get((req, res) => {
    new user({ roleId: 4 }).getSingleUserByRole(req, res);
  })
  .put((req, res) => {
    new user({ roleId: 4 }).updateUser(req, res);
  });

router
  .route("/user/member")
  .get((req, res) => {
    new user({ roleId: 5 }).userByRole(req, res);
  })
  .post((req, res) => {
    new user({ roleId: 5 }).addUserByRole(req, res);
  });

router
  .route("/user/member/:id")
  .get((req, res) => {
    new user({ roleId: 5 }).getSingleUserByRole(req, res);
  })
  .put((req, res) => {
    new user({ roleId: 5 }).updateUser(req, res);
  });
/* active unactive user */
router.put("/user/status/:id", new user().activeUnactiveUser);
router.put("/user/bulkOperation", new user().bulkOperation);

/**route for get user level 2 document access requests  */
router
  .route("/user/documentRequests")
  .get(new user().levelTwoDocumentAccessRequests)
  .put(new user().acceptRejectLevelTwoDocumentRequests);

router.route("/user/allManager").get((req, res) => {
  new user({ roleId: 3 }).userByRole(req, res);
});
/* get, update and delete single user details */
/**user profile */
router
  .route("/user/profile")
  .get(new user().getSingleLoggedInUserDetails)
  .put(uploader.uploadProfilepic.single("profile_pic"), new user().updateUser);

router
  .route("/user/profile-pic")
  .put(
    uploader.uploadProfilepic.single("image"),
    new user().updateprofileImage
  );

router
  .route("/user/:id")
  .get(new user().getSingleUser)
  .delete(new user().deleteUser)
  .put(new user().updateUser);

// to fetch the permissions
router.get("/permissions", new user().getPermissions);

router.post(`/changePassword`, new user().ChangeMemberPassword);

/************************************************************************* MEMBER DASHBOARD ROUTES ******************************************************************/
const memberPrefix = "/member";
router.get(
  `${memberPrefix}/popularTrainingsTypes`,
  new trainingType().popularTrainingType
);

router.post(
  `${memberPrefix}/globalSearch`,
  new resources().globalDocumentSearch
);
router.get(
  `${memberPrefix}/subjectsResoures/:subjectId`,
  new resources().subjectsResources
);
router.get(
  `${memberPrefix}/trainingTypeResoures/:trainingTypeId`,
  new resources().subjectsResources
);

router.post(
  `${memberPrefix}/sendLevel2PermissionRequest`,
  new user().sendLevel2PermissionRequest
);

router.get(`${memberPrefix}/documentdetails/:id`, new resources().getOne);

router
  .route(`${memberPrefix}/favouriteDocumets`)
  .post(new addToFavourite().addAndRemove);
router
  .route(`${memberPrefix}/getFavouriteDocumets`)
  .post(new addToFavourite().getFavoriteDocument);

router
  .route(`${memberPrefix}/favouriteDocuemntsFolder`)
  .get(new addToFavourite().getFavoriteDocumentsFolders)
  .post(new addToFavourite().createFavouriteFolder);

router.post(`${memberPrefix}/contactUs`, new user().ContactformAdd);

router.get(
  `${memberPrefix}/get_managerDetails`,
  new user().GetMyManagerDetails
);

router
  .route(`${memberPrefix}/cart`)
  .get(new resources().getCart)
  .post(new resources().addResourcesToCart);

router.delete(`${memberPrefix}/cart/:cartId`, new resources().removeFromCart);

router.get(
  `${memberPrefix}/downloadreRources/:cartId/:documentId`,
  new resources().downloadDocument
);

router.get(
  `${memberPrefix}/downloadreAllRources`,
  new resources().downloadMultipleDocument
);

router.post(`${memberPrefix}/videoWatchTime`, new resources().videoWatchVideo);

router.get(`${memberPrefix}/getAllTrainingTypes`, new trainingType().getAll);

router.get(`${memberPrefix}/getAllSubjects`, new subjectController().getAll);

/**************************************************** END MEMBER DASHBOARD ROUTES ************************************************************************/

/*********************************************************** USER ACTIVITY LOGS *******************************************************************/
const logsPrefix = "/userLogs";
router.get(`${logsPrefix}`, new user().userActivityLogs);

/********************************************************* ENDUSER ACTIVITY LOGS *******************************************************************/
/** export the router module */
module.exports = router;
