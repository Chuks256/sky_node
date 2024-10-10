
require("dotenv").config();
const jwt = require("jsonwebtoken");

const function_guard ={
    protectUserRoute:async(req,res,next)=>{
        const [authorization] = req.body;
        if(authorization.length===0){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"invalid token"})
        }
        else{
            if(authorization.length>0){
                next();
            }
        }
    },
    protectAdminRoute:async(req,res,next)=>{

    }
}

module.exports = {function_guard};