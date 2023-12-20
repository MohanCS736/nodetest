const memberAssignedManagerModel = require("../models/MemberAssignedManagers");
const managerAssignedStatesModel = require("../models/managerAssignedStates");
const htmlTemplate =(data)=>{ 
   const template =`<table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
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
                                                                no manager found for member  email : '${data.email}'</td>
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
                </table>`
                return template;
            }
module.exports.assingManageToMemberBasedOnCountryAndState = async(data) =>{
     /** find the manager of same country member  */
     const managers = await managerAssignedStatesModel.findAll({
        where: { country: data.country },
      });
      const html = htmlTemplate(data);
      /**if no country found then send mail to admin */
      if (managers.length === 0){
        mail.generateMail(
            process.env.ADMIN_EMAIL,
            subject.MANAGER_NOT_FOUND,
            html
          );
          return {message:"no manager found for selected country",note:"only country code and state code is worked"}
      }
        
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
          const assigningManager = await memberAssignedManagerModel.create(assign);
          if(assigningManager) return {message:"manager assign to member"}
          // console.log(assigningManager);
        } else {
          /**if no manager found for assigning the member then send mail to admin */
          mail.generateMail(
            process.env.ADMIN_EMAIL,
            subject.MANAGER_NOT_FOUND,
            html
          );
          return {message:"no manager found for selected country and state",note:"only country code and state code is worked"}
        }
      }
}