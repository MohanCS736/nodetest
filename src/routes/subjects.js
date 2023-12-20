const express = require('express');
const router = express.Router();
const subjects = require('../controllers/subjectController');
const uploader = require('../middlewares/uploader/uploader')

router.use(express.urlencoded({ extended: true })); /*/ Parse URL-encoded bodies*/
router.use(express.json()); /*/ Parse JSON bodies*/

const middlewares = require('../middlewares/authenticators/authenticator');
const { body } = require('express-validator');

/*adding the middle ware for not access the unauthenticated  users */
// router.use(middlewares.authenticator);
router.route('/')
.get(new subjects().getAll)
.post(uploader.uploadSubjectsImages.single('image'),[
    body('name').notEmpty()
   .withMessage('name is required.'),
    body('description').notEmpty()
    .withMessage('description is required.'),
    body('view').notEmpty()
    .withMessage('Status is required.'),
   ],new subjects().add);

router.put('/bulkOperation',new subjects().bulkOperation);
/**get all subject without pagination */
router.get('/allSubjects',new subjects().getAllSubject);
router.get('/fetchSubjects', new subjects().getparticularUserSubjects);



router.route('/:id')
.get(new subjects().getOne)
.delete(new subjects().delete)
.put(uploader.uploadSubjectsImages.single('image'),new subjects().update);

router.put('/changeStatus/:id',new subjects().enableDisableSubject);
/** export the router module */
module.exports = router;