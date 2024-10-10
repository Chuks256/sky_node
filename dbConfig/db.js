
require("dotenv").config();
const mongooseModel = require("mongoose");

try{
    mongooseModel.connect(process.env.CLUSTER_URI);
    console.log("Successfully connected to cluster")
}
catch(error){
    console.error("failed to connect to db Cluster ")
}


module.exports = mongooseModel;