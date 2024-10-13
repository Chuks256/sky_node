// define required modules 
require("dotenv").config();
require("./dbConfig/db")

// define modules 
const endpoint_port = 4432 || process.env.PORT;
const expressModule = require("express");
const app =expressModule();
const cors = require("cors");
const bodyParserModule = require("body-parser");

// define functions
const functionModule = require("./functions/functionModule");
const definedFunction = new functionModule();
const {function_guard} = require("./guard/functionGuard.secure")

// setup middlewares 
app.use(cors())
app.disable("x-powered-by");
app.use(bodyParserModule.json())
app.use(bodyParserModule.urlencoded({extended:false}));
app.use(expressModule.json());

// define function routes 

// # getters route 
app.get(`/endpoint/${process.env.API_VERSION}/generatePrivateKey`,definedFunction.autoGeneratePrivateKey);
app.get(`/endpoint/${process.env.API_VERSION}/getUsersFollowers`,function_guard.protectUserRoute,definedFunction.getAllFollowers);
app.get(`/endpoint/${process.env.API_VERSION}/getUserPointBalance`,function_guard.protectUserRoute,definedFunction.getUserPoint);
app.get(`/endpoint/${process.env.API_VERSION}/getUserData`,function_guard.protectUserRoute,definedFunction.getUserData);
app.get(`/endpoint/${process.env.API_VERSION}/isSystemOK`,definedFunction.isSystemOk);
app.get(`/endpoint/${process.env.API_VERSION}/listAllUsersPost`,function_guard.protectUserRoute,definedFunction.listAllPost);
app.get(`/endpoint/${process.env.API_VERSION}/listAllUsers`,function_guard.protectUserRoute,definedFunction.listAllUser);
app.get(`/endpoint/${process.env.API_VERSION}/listSpecificUserPost`,function_guard.protectUserRoute,definedFunction.listAllUserSpecificPost);
app.get(`/endpoint/${process.env.API_VERSION}/listAllReferredUsers`,function_guard.protectUserRoute,definedFunction.getAllReferrals);
app.get(`/endpoint/${process.env.API_VERSION}/generateReferralCode`,function_guard.protectUserRoute,definedFunction.generateReferralCode);
app.get(`/endpoint/${process.env.API_VERSION}/importAccount`,definedFunction.importAccount);


// # Post routes 
app.post(`/endpoint/${process.env.API_VERSION}/commentOnPost`,function_guard.protectUserRoute,definedFunction.commentOnPost);
app.post(`/endpoint/${process.env.API_VERSION}/createNewAccount`,definedFunction.createNewAccount);
app.post(`/endpoint/${process.env.API_VERSION}/upvote`,function_guard.protectUserRoute,definedFunction.upVotePost)
app.post(`/endpoint/${process.env.API_VERSION}/downVote`,function_guard.protectUserRoute,definedFunction.downVotePost);
app.post(`/endpoint/${process.env.API_VERSION}/postNewContent`,function_guard.protectUserRoute,definedFunction.postContent);
app.post(`/endpoint/${process.env.API_VERSION}/followAccount`,function_guard.protectUserRoute,definedFunction.followUser);
app.post(`/endpoint/${process.env.API_VERSION}/unFollowAccount`,function_guard.protectUserRoute,definedFunction.unFollowUser);
app.post(`/endpoint/${process.env.API_VERSION}/removeDownVoteReaction`,function_guard.protectUserRoute,definedFunction.unDownVotePost);
app.post(`/endpoint/${process.env.API_VERSION}/removeUpVoteReaction`,function_guard.protectUserRoute,definedFunction.unUpVotePost);
app.post(`/endpoint/${process.env.API_VERSION}/performDailyCheck-in`,function_guard.protectUserRoute,definedFunction.performDailyCheckin); // # soon 

// sudo endpoint 
app.post(`/endpoint/${process.env.API_VERSION}/clearAllData`,definedFunction.sudoDeleteAllData); // # soon 



app.listen(endpoint_port,async()=>{
    console.log("Endpoint api is currently running")
})

