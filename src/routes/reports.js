const express = require('express');
const router = express.Router();
const reports = require('../controllers/reports');

router.use(express.urlencoded({ extended: true })); /*/ Parse URL-encoded bodies*/
router.use(express.json()); /*/ Parse JSON bodies*/


router.route('/resource').get(new reports().DataDownload);
router.route('/member').get(new reports().memberReport);

router.route('/:activityType/:type/:documentId').get(new reports().documentActivity);

router.route('/member-time-spent').get(new reports().find);

module.exports = router;