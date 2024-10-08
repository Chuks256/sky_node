require("dotenv").config();
const {User} = require("../models/user.model");
const {utilHelper} = require("../utils/utilHelper");
const jwt = require("jsonwebtoken")
const {Post}= require("../models/post.model")

class functionModules{

    // function for creating new user account 
    async createNewAccount(req,res){
        const {profileName,privateKey,ambientColor}=req.body;
        const convertPrivToPub=utilHelper.generateUserPublicKey(privateKey)
       
        try{
            const checkPrivateKeyExist=await User.findOne({publicKey:convertPrivToPub});
            if(checkPrivateKeyExist){
                res.status(process.env.FAILED).json({message:"account already exist"})
            }
            else{
                if(! checkPrivateKeyExist){                    
            //  define  user data parans 
            const data={
            profileName:profileName,
            publicKey:convertPrivToPub,
            ambientColor: ambientColor 
            }

            try{
                 await new User(data);
                 const userSessionToken=jwt.sign({userPublicKey:convertPrivToPub},process.env.ENDPOINT_SESSION_SECRET)
                 res.status(process.env.SYSTEM_OK).json({message:"account successfuly created",authorization:userSessionToken});
            }
            catch(error){
                res.status(process.env.TECHNICAL_ISSUE).json({error:"Something went wrong"})
            }
        }
    }
}
catch(exception){
            res.status(process.env.TECHNICAL_ISSUE).json({error:'Something went wrong'})
        }
    }


    // import user account 
    async importAccount(req,res){
        const {privateKey}=req.body;
        const convertPrivToPub=utilHelper.generateUserPublicKey(privateKey)
        
        try{
            const checkPrivateKeyExist=await User.findOne({publicKey:convertPrivToPub});
            if(checkPrivateKeyExist){
                const userSessionToken=jwt.sign({userPublicKey:convertPrivToPub},process.env.ENDPOINT_SESSION_SECRET)
                res.status(process.env.SYSTEM_OK).json({message:"account successfully imported",authorization:userSessionToken});
            }
            else{
                if(!checkPrivateKeyExist){
                    res.status(process.env.FAILED).json({message:"invalid address"});
                }
            }
        }
        catch(error){
            res.status(process.env.TECHNICAL_ISSUE).json({error:"Something went wrong"})
        }
        
    }

    // FUNCTIONFOR POSTING CONTENT 
    async postContent(req,res){

    }

    // FUNCTION FOR REACTING TO POST 
    async upVotePost(res,res){
        const {postId}=req.body;
        try{
            const getSpecificPost = await Post.findOne({_id:postId});
            getSpecificPost.upVoteReaction +=1;
            getSpecificPost.save();
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }

    // FUNCTION TO UNVOTE POST 
    async unUpVotePost(req,res){
        const {postId}=req.body;
        try{
            const getSpecificPost = await Post.findOne({_id:postId});
            getSpecificPost.upVoteReaction -=1;
            getSpecificPost.save();
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }


    // FUNCTION TO DOWNVOE POST 
    async downVotePost(req,res){
        const {postId}=req.body;
        try{
            const getSpecificPost = await Post.findOne({_id:postId});
            getSpecificPost.downVoteReaction +=1;
            getSpecificPost.save();
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }

    // FUNCTION TO UNDOWNVOTE
    async unDownVotePost(req,res){
        const {postId}=req.body;
        try{
            const getSpecificPost = await Post.findOne({_id:postId});
            getSpecificPost.downVoteReaction -=1;
            getSpecificPost.save();
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }

    // FUNCTION TO COMMENT ON POST 
    async commentOnPost(req,res){
        const {postId,comment_content,authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
        try{
            const getUserId= await User.findOne({publicKey:sanitizeToken.userPublicKey})
            const getSpecificPost = await Post.findOne({_id:postId});
            const payloadData={
                userId:getUserId,
                content:comment_content,
                timeCommented:new Date().toISOString().slice(0,10)
            }
            await getSpecificPost.comments.push(payloadData)
            await getSpecificPost.save();
            res.status(process.env.SYSTEM_OK).json({message:"commented successfully"})
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }

    // FUNCTION TO GET ALL POST 
    async listAllPost(req,res){
        try{
            const getAllPost = await Post.find();
            res.status(process.env.SYSTEM_OK).json(getAllPost)
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }

    // FUNCTION TO FOLLW ANOTHER USER ACOUNT 
    async toggleFollowUser(req,res){}

    // FUNCTION TO GET ALL USERS 
    async listAllUser(req,res){
        try{
            const getAllUser = await User.find();
            res.status(process.env.SYSTEM_OK).json(getAllUser)
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }

    // FUNCTION FOR GETTING SPECIFIC USER FOLLOWERS 
    async getAllFollowers(req,res){
        const {authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
       try{
        const getUserFollowers= await User.findOne({publicKey:sanitizeToken.userPublicKey})
        res.status(process.env.SYSTEM_OK).json(getUserFollowers.followers);
       }
       catch(err){
        res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
       }
    }

    // FUNCTION FOR SPECIFIC USER POST 
    async listAllUserSpecificPost(res,req){
        const {authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
       try{
        const getUserFollowers= await User.findOne({publicKey:sanitizeToken.userPublicKey})
        const getUserPost = await Post.findOne({postOwnerId:getUserFollowers._id})
        res.status(process.env.SYSTEM_OK).json(getUserPost);
       }
       catch(err){
        res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
       }
    }
    
    // FUNCTION FOR GETTING A SPECIFIC USER POST 
    async getSpecificPost(req,res){
        const {postId} =req.body;
        try{
            const getSpecificPost = await Post.findOne({_id:postId})
            res.status(process.env.SYSTEM_OK).json(getSpecificPost);
           }
           catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
           }
    }

    // FUNCTION FOR AUTO GENERATING PRIVATE KEY
    async autoGeneratePrivateKey(req,res){
        const _autoGeneratePrivateKey=utilHelper.generateUserPrivateKey();
        try{
            res.status(process.env.SYSTEM_OK).json(_autoGeneratePrivateKey);   
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
        }
    }

    
    // FUNCTIION FOR GENERATING REFERRAL CODE 
    async generateReferralCode(req,res){
        const {authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
       try{
        const generatedReferralCodes = utilHelper.generateReferralCodes()
        const getUserReferrals= await User.findOne({publicKey:sanitizeToken.userPublicKey});
        getUserReferrals.referralCodes.push(generatedReferralCodes)
        res.status(process.env.SYSTEM_OK).json({referralCode:generatedReferralCodes});
       }
       catch(err){
        res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
       }
    }

    // // FUNCTION FOR SIGNUP
    // async signupViaReferral(req,res){
    //     const {authorization} =req.body;
    //     const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
    //    try{
    //     const generatedReferralCodes = utilHelper.generateReferralCodes()
    //     const getUserReferrals= await User.findOne({publicKey:sanitizeToken.userPublicKey});
    //     getUserReferrals.referralCodes.push(generatedReferralCodes)
    //     res.status(process.env.SYSTEM_OK).json({referralCode:generatedReferralCodes});
    //    }
    //    catch(err){
    //     res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
    //    }
    // }

    // FUNCTION FOR PERFOMING DAILY CHECKIN 
    async performDailyCheckin(req,res){

    }

    // FUNCTION FOR GETTING USER POINTS 
    async getUserPoint(req,res){
        const {authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
       try{
        const getUserData= await User.findOne({publicKey:sanitizeToken.userPublicKey});
        res.status(process.env.SYSTEM_OK).json(getUserData.points);
       }
       catch(err){
        res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
       }
    }

    // FUNCTION FOR GETTING USER DATA 
    async getUserData(req,res){
        const {authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
       try{
        const _getUserData= await User.findOne({publicKey:sanitizeToken.userPublicKey});
        res.status(process.env.SYSTEM_OK).json(_getUserData);
       }
       catch(err){
        res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
       }
    }

    // FUNCTION FO GET ALL USERS REFERRAL 
    async getAllReferrals(req,res){
        const {authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
       try{
        const getUserReferrals= await User.findOne({publicKey:sanitizeToken.userPublicKey});
        res.status(process.env.SYSTEM_OK).json(getUserReferrals);
       }
       catch(err){
        res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
       }
    }

    // DO  THIS LATER
    async deletePost(req,res){}

    async deleteSpecificPostComment(req,res){}

}

module.exports = functionModules;