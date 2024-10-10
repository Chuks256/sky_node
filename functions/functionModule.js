require("dotenv").config();
const {User} = require("../models/user.model");
const {utilHelper} = require("../utils/utilHelper");
const jwt = require("jsonwebtoken")
const {Post}= require("../models/post.model")

// points to give 
const UPVOTE_POINT = 50;
const DAILY_LOGINS_POINTS=[50,100,150,200,250,500];
const REFERRAL_POINTS = 100;
const COMMENT_POINTS =15;

// Define class 
class functionModules{

    // function for creating new user account 
    async createNewAccount(req,res){
        const {profileName,privateKey,ambientColor}=req.body;
        const convertPrivToPub=utilHelper.generateUserPublicKey(privateKey);
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
            ambientColor: ambientColor,
            dateCreated:new Date().toISOString().slice(0,10) 
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


    // FUNCTION FOR POSTING CONTENT 
    async postContent(req,res){
        const {authorization,postContent,media} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
        try{
            if(media.length===0){
            const getUserId= await User.findOne({publicKey:sanitizeToken.userPublicKey})
            const dataParams={
                postOwnerId:getUserId._id,
                content:postContent,
                timePosted:new Date().toISOString().slice(0,10)
            }
            const _createNewPost = await new Post(dataParams);
            await _createNewPost.save();
            res.status(process.env.SYSTEM_OK).json({message:"posted successfully"})
            }
            else{
                if(media.length>0){
                    // upload media to cloud 
                }
            }
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }


    // FUNCTION FOR REACTING TO POST 
    async upVotePost(req,res){
        const {authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
        const {postId,accountId}=req.body;
        try{
            // get user id 
            const getUserId= await User.findOne({publicKey:sanitizeToken.userPublicKey})
            const getSpecificPost = await Post.findOne({_id:postId});
            getSpecificPost.upVoteReaction +=1;
            
            if(getUserId._id != accountId){
            getUserId.points+=UPVOTE_POINT;
            await getUserId.save();
            
            }
            await getSpecificPost.save();
            res.status(process.env.SYSTEM_OK)
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


    // FUNCTION TO DOWNVOE POST || down
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
        const {postId,accountId,comment_content,authorization} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
        try{

            const getUserId= await User.findOne({publicKey:sanitizeToken.userPublicKey})
            const getAccountCommentedOn= await User.findOne({_id:accountId});
            const getSpecificPost = await Post.findOne({_id:postId});
            const payloadData={
                userId:getUserId._id,
                content:comment_content,
                timeCommented:new Date().toISOString().slice(0,10)
            }

            if(getUserId._id != getAccountCommentedOn._id){
                getUserId.points+=COMMENT_POINTS;
                await getUserId.save();
                await getSpecificPost.comments.push(payloadData)
                await getSpecificPost.save();
            }
            else{
                if(getUserId._id===getAccountCommentedOn._id){
                    await getSpecificPost.comments.push(payloadData)
                    await getSpecificPost.save();                 
                }
            }
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
    async toggleFollowUser(req,res){
        const {authorization,accountId} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
        try{
            const getUserId= await User.findOne({publicKey:sanitizeToken.userPublicKey})
            const findSpecifiedAccount = await User.findOne({_id:accountId});
            // Run a loop
            for(const specific_acct_id of findSpecifiedAccount.followers){
                if(accountId!=specific_acct_id){
                    await findSpecifiedAccount.followers.push(getUserId._id);
                    res.status(process.env.SYSTEM_OK).json({message:"Successfully followed account"})
                }
                else{
                    if(accountId === specific_acct_id){
                        const newFollowerList = findSpecifiedAccount.followers.filter(followers_list =>followers_list !== accountId )
                        getUserId.followers=newFollowerList;
                        await getUserId.save();
                        res.status(process.env.SYSTEM_OK).json({message:" successfully unfollowed account"})
                    }
                }
            }
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }

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

    // FUNCTION TO CHECK SYSTEM HEALTH
    async isSystemOk(req,res){
        res.json(process.env.SYSTEM_OK).json({message:true})
    }

    // DO  THIS LATER
    async deletePost(req,res){}

    async deleteSpecificPostComment(req,res){}

}

module.exports = functionModules;