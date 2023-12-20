const express = require("express");
const router = express.Router();
const resources = require("../controllers/resources");
const uploader = require("../middlewares/uploader/uploader");
const trainingType = require("../controllers/trainingType");

router.use(
  express.urlencoded({ extended: true })
); /*/ Parse URL-encoded bodies*/
router.use(express.json()); /*/ Parse JSON bodies*/

router
  .route("/")
  .get(new resources().getAll)
  .post(uploader.uploadDocuments.single("fileName"), new resources().add);

router.put("/bulkOperation", new resources().bulkOperation);
router.put("/resourceStatus", new resources().resourceStatusUpdate);
router.get("/fetchResources", new resources().getAll);

router.route("/document-levels").get(new resources().fetchAllLevels);

router.put("/changeStatus/:id", new resources().enableDisableResource);
router.post("/addTraining", new trainingType().add);
router.get("/getTraining", new trainingType().getAll);

// router.get('/subjectsResoures/:id',new resources().subjectsResourses)
router
  .route("/request/:contributorId?")
  .get(new resources().fetchRequests)
  .put(new resources().acceptRejectDocumentRequests);

// router.get('/subjectsResoures/:subjectId',new resources().subjectsResources)
router.get(
  "/trainingResoures/:trainingTypeId",
  new resources().subjectsResources
);

// Routes for Training
router.route("/trainings").get(new trainingType().getAll);

router.get(
  "/particularResource/:trainingId",
  new resources().getParticularTrainingTypeResources
);

router.get("/getTrainingName/:trainingId", new trainingType().getTrainingName);

router.route("/trainingsActive").get(new trainingType().getAllActive);

router
  .route("/training/:id")
  .get(new trainingType().getOne)
  .delete(new trainingType().delete)
  .put(new trainingType().update);

router.get("/mydownloads", new resources().DownloadsLists);

router.put("/trainingStatus/:id", new trainingType().enableDisableTraining);
router.put("/bulkOperationTraining", new trainingType().bulkOperation);

router
  .route("/:id")
  .get(new resources().getOne)
  .delete(new resources().delete)
  .put(uploader.uploadDocuments.single("fileName"), new resources().update);

module.exports = router;
