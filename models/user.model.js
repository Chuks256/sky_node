const mongooseModel = require("../dbConfig/db");

// colors
// fiery -> red 
// girlPower -> pink  
// emerald -> green 
// sunshine -> yellow
// sky [default] -> blue 
// royal -> orange 
// pride  - multicolor

const userModel = new mongooseModel.Schema({
    profileName:{type:String,required:true},
    profileBio:{type:String},
    profilePics:{type:String},
    publicKey:{type:String,required:true},
    ambientColor:{type:String,default:'sky'},
    followers:[{type:String}],
    points:{type:Number,default:0},
    dailyCheckins:{type:Number,default:0},
    referralCodes:[{type:String}],
    dateCreated:{type:String}
})

const User = mongooseModel.model("User",userModel);

module.exports = {User}