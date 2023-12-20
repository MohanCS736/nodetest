require('dotenv').config();
const usersModel = require('../models/users');
const rolesModel = require('../models/roles');
const userHaveRolesModel = require('../models/userHaveRoles');
const reportsModel= require('../models/reports');

class managerController{

     async ManagersListing(req,res){
       try {
        const adminData = await rolesModel.findAll({
          where:{
              id:3
          },
          include: {
            model: usersModel,
            attributes: ['id','firstName','lastName','email','phone','zipcode'], // Replace with your desired columns
          }
      });
      //return res.json({data:adminData})
      res.send({data:adminData})

        } catch (error) {

            console.error('Error fetching user:', error);
        }
     }
      async ManagersEdit(req,res,itemId){

       try{
        const managerProfile = await usersModel.findOne({where:{id:itemId},attributes:['id','firstName','lastName','email','phone','zipcode']})
        return res.json({data:managerProfile })
        
         }catch(error){
    
           console.error('Error In Edit User');
       }

     }
     async ManagersProfileUpdate(req,res){
 
      try{
        const data = req.body; 
        usersModel.update(
          data.data,{where:{id:data.data.id}},            
          (err,dataupdate ) => {
            if (err) {
              console.error('Error:', err);
              // Handle the error here
            } else {
              console.log('Updated Data:',dataupdate );
              // Handle the updated document here
            }
          }
        );
        
        res.status(200).json({ message: 'Data received successfully' });

       }catch(error){
 
        console.error('Error In Code Please Fix');
      }

     }
 
}
module.exports = managerController;