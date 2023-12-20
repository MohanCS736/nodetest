module.exports.loginWithCorrectCredentails ={
  email: "sitesuperadmin@yopmail.com",
  password: "password",
}
module.exports.loginWithWrongEmail ={
  email: "Siteuperadmin@yopmail.com",
  password: "Admin@123",
}
module.exports.loginWithWrongPassword ={
  email: "sitesuperadmin@yopmail.com",
  password: "A@123",
}
module.exports.existingMemberSignUp = {
  firstName: "member",
  lastName: "test",
  username: "member@yopmail.com",
  email: "member@yopmail.com",
  company: "abc",
  address: "#abc location,xyz",
  country: "CA",
  state: "NB",
  city: "Edmundston",
  zipcode: 16010,
  phone: 1234567891,
  password: "password",
  status: 1,
  verificationToken: true,
  isVerified: true,
}
module.exports.newMemberSignUp = {
  firstName: "member",
  lastName: "test",
  username: "member1@yopmail.com",
  email: "member1@yopmail.com",
  company: "abc",
  address: "#abc location,xyz",
  country: "CA",
  state: "NB",
  city: "Edmundston",
  zipcode: 16010,
  phone: 1234567891,
  password: "password",
  status: 1,
  verificationToken: true,
  isVerified: true,
}
module.exports.loginWithSuperAdmin ={
  email: "superadmin@yopmail.com",
  password: "password",
}
module.exports.loginWithManager ={
  email: "manager@yopmail.com",
  password: "password",
}
module.exports.loginWithContent ={
email: "contentcontributor@yopmail.com",
password: "password",
}
module.exports.loginWithMember ={
email: "member@yopmail.com",
password: "password",
}
module.exports.addNewSuperAdmin = {
  firstName: "new ",
  lastName: "superadmin",
  username: "newsuperadmina@yopmail.com",
  email: "newsuperadmina@yopmail.com",
  company: "abc",
  address: "#abc location,xyz",
  country: "CA",
  state: "NB",
  city: "Edmundston",
  zipcode: 16010,
  phone: 1234567891,
  password: "password",
  status: 1,
  verificationToken: true,
  isVerified: true,
}
module.exports.addNewManager = {
  firstName: "new ",
  lastName: "manager",
  username: "newmanager@yopmail.com",
  email: "newmanager@yopmail.com",
  company: "abc",
  address: "#abc location,xyz",
  country: "CA",
  state: "NB",
  city: "Edmundston",
  zipcode: 16010,
  phone: 1234567891,
  password: "password",
  status: 1,
  verificationToken: true,
  isVerified: true,
  assignedCountry:"CA",
  assignedStates:['AB,MB']
}
module.exports.addNewContentContributor = {
  firstName: "new ",
  lastName: "contentcontributor",
  username: "newcontentcontributor@yopmail.com",
  email: "newcontentcontributor@yopmail.com",
  company: "abc",
  address: "#abc location,xyz",
  country: "CA",
  state: "NB",
  city: "Edmundston",
  zipcode: 16010,
  phone: 1234567891,
  password: "password",
  status: 1,
  verificationToken: true,
  isVerified: true,
  manager:8
}
module.exports.addNewMember = {
  firstName: "new ",
  lastName: "member",
  username: "newMember@yopmail.com",
  email: "newMember@yopmail.com",
  company: "abc",
  address: "#abc location,xyz",
  country: "CA",
  state: "NB",
  city: "Edmundston",
  zipcode: 16010,
  phone: 1234567891,
  password: "password",
  status: 1,
  verificationToken: true,
  isVerified: true,
  level:1,
  manager:8
}
module.exports.updatingNewManager = {
  firstName: "new ",
  lastName: "manager",
  username: "newmanager@yopmail.com",
  email: "newmanager@yopmail.com",
  company: "abc",
  address: "#abc location,xyz",
  country: "CA",
  state: "NB",
  city: "Edmundston",
  zipcode: 16010,
  phone: 1234567891,
  password: "password",
  status: 1,
  verificationToken: true,
  isVerified: true,
  assignedCountry:"CA",
  assignedStates:['NT','NS']
}
module.exports.updatingNewMember = {
  firstName: "new ",
  lastName: "member",
  username: "newMember@yopmail.com",
  email: "newMember@yopmail.com",
  company: "abc",
  address: "#abc location,xyz",
  country: "CA",
  state: "NB",
  city: "Edmundston",
  zipcode: 16010,
  phone: 1234567891,
  password: "password",
  status: 1,
  verificationToken: true,
  isVerified: true,
  level:2
}
module.exports.bulkOperation = {
  disable:{
    id:[1,2,4],
    action:"disable"
  },
  enable:{
    id:[1,2,4],
    action:"enable"
    },
  delete:{
    id:[1,2,4],
    action:"delete"
    },
  random:{
    id:[1,5,8],
    action:"asdfasdf"
  },
  anonymous:{
    id:[55555,5555],
    action:"disable"
  }
}

  