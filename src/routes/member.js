const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
const tokenstring = require('../controllers/Authenticator');
const managerController = require('../controllers/managerController');
const {body} = require('express-validator');

router.use(express.urlencoded({ extended: true })); /*/ Parse URL-encoded bodies*/
router.use(express.json()); /*/ Parse JSON bodies*/

const myInstanceMananger = new managerController();
$prefix = "member";

/**test route */
router.get('/',(req,res)=>{
    res.send('server is working');
});

/*** for Authentication */ 
router.post('/token', tokenstring.Authenticator);

router.get('/member/listing',(req,res) =>{
    myInstanceMananger.MemberListing(req,res);
});
router.get('/manager/edit/:id', (req, res) => {
    const itemId = req.params.id; // Get the 'id' parameter from the URL
    
     myInstanceMananger.ManagersEdit(req, res, itemId); // Pass the 'id' parameter to your function
});
router.post('/save/managerprofile', (req, res) => {
    
     myInstanceMananger.ManagersProfileUpdate(req, res);
});



/** sign up route */
router.route(`/member/signup`)
.get(new user().signup)
.post(new user().signup)
/** login route */
router.route('/login')
.get(new user().login)
.post(new user().login)/* Add user and only site super admin can add the users */
router.post('/addUser',new user().addUser);
/* delete user */

/** export the router module */
module.exports = router;