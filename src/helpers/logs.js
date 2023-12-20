const userActivityModel = require('../models/userActivity') 
const usersModel = require('../models/users');
const rolesModel = require('../models/roles');


 module.exports.activityTypesArray = ['ERROR', 'INFO', 'DEBUG','NOTICE','WARNING','ALERT','CRITICAL','EMERGENCY','TIMEOUT'];

module.exports.addUserActivity = async(activity) =>{
    const user = activity.req.user;
    const userDetails = await usersModel.findOne({where:{id:user.userId}, include:rolesModel});
    const activityData = {};
    activityData.takenBy = userDetails.email;
    activityData.takenByRole = userDetails.roles[0].role;
    activityData.activityName = activity.name;
    activityData.description = activity.description;
    activityData.activityType = activity.type;
    activityData.error = (activity.error)?activity.error:'';
    const addLog = await userActivityModel.create(activityData);
    return addLog
}

module.exports.activityTypes = {ERROR:'ERROR', 
                                    INFO:'INFO',
                                     DEBUG:'DEBUG',
                                     NOTICE:'NOTICE',
                                     WARNING:'WARNING',
                                     ALERT:'ALERT',
                                     CRITICAL:'CRITICAL',
                                     EMERGENCY:'EMERGENCY',
                                     TIMEOUT:'TIMEOUT'}


module.exports.activity = {
                            req: "",
                            name: "",
                            description: "",
                            type: "",
                            error: "",
                            };

module.exports.usersRole = {
    1:'Site Super Admin',
    2:'Super Admin',
    3:'Manager',
    4:'Content Contributor',
    5:'Member',
}