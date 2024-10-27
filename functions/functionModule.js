require("dotenv").config();
const {User} = require("../models/user.model");
const {utilHelper} = require("../utils/utilHelper");
const jwt = require("jsonwebtoken")
const {Post}= require("../models/post.model")
const mongoose=require("mongoose");

// points to give 
const UPVOTE_POINT = 50;
const DAILY_LOGINS_POINTS=[50,100,150,200,250,500];
const COMMENT_POINTS =15;

// Define class 
class functionModules{

    // function for creating new user account 
    async createNewAccount(req,res){
        const {profileName,profilePics,privateKey,ambientColor}=req.body;
        const convertPrivToPub=utilHelper.generateUserPublicKey(privateKey);
        const checkAccountExist=await User.findOne({profileName:profileName});

        if(checkAccountExist!==null){
            res.status(process.env.SYSTEM_OK).json({message:"Account already exist"})
        }
        else{
            if(checkAccountExist===null){
                try{                   
            //  define  user data parans 
            const data={
            profileName:profileName,
            profilePics:profilePics,
            profileBio:"",
            publicKey:convertPrivToPub,
            ambientColor: ambientColor,
            points:10,
            lastClaimed:new Date().toISOString().slice(0,10),
            dateCreated:new Date().toISOString().slice(0,10) 
            }
            // save use da
                const create_new_account=new User(data);
                await create_new_account.save();
                const userSessionToken=jwt.sign({userPublicKey:convertPrivToPub},process.env.ENDPOINT_SESSION_SECRET)
                res.status(200).json({message:"account successfuly created",authorization:userSessionToken});
            }
            catch(error){
                res.status(process.env.TECHNICAL_ISSUE).json({error:"Something went wrong"})
            }        
        }
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
                res.status(process.env.SYSTEM_OK).json({message:"correct_address",authorization:userSessionToken});
            }
            else{
                if(!checkPrivateKeyExist){
                    res.status(403).json({message:"invalid address"});
                }
            }
        }
        catch(error){
            res.status(process.env.TECHNICAL_ISSUE).json({error:"Something went wrong"})
        }     
    }


    // FUNCTION FOR POSTING CONTENT 
    async postContent(req,res){
        const{authorization}=req.headers;
        const {postContent,media}=req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
        try{
            if(media.length===0){
            const getUserId= await User.findOne({publicKey:sanitizeToken.userPublicKey})
            const dataParams={
                postOwnerId:getUserId._id,
                profileName:getUserId.profileName,
                profilePics:getUserId.profilePics,
                content:postContent,
                timePosted:new Date().toISOString().slice(0,10)
            }
            const _createNewPost = await new Post(dataParams);
            await _createNewPost.save();

            res.status(200).json({message:"posted successfully"})
            console.log(_createNewPost)
            }
            else{
                if(media.length>0){
                    // if post contains photo, upload to cloud , then save content
                }
            }
        }
        catch(err){
            res.status(501).json({message:"Something went wrong"})
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
            res.status(process.env.SYSTEM_OK).json({msg:"done"})
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
            if(getAllPost){
            res.status(process.env.SYSTEM_OK).json(data)
            }
        }
        catch(err){
            res.status(501).json({message:"Something went wrong"})
        }
    }

    // FUNCTION TO FOLLW ANOTHER USER ACOUNT 
    async followUser(req,res){
        const {authorization,accountId} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
        try{
            const getUserId=await User.findOne({publicKey:sanitizeToken.userPublicKey})
            const findSpecificAcctToFollow=await User.findOne({_id:accountId});
            // after getting user account id : check if user was followinf account before
           if(findSpecificAcctToFollow.followers.length===0){
            findSpecificAcctToFollow.points+=1;
            await findSpecificAcctToFollow.followers.push(getUserId._id);
            await findSpecificAcctToFollow.save();
            res.status(200).json({message:"Successfully followed account"});
           }
           else{
            if(findSpecificAcctToFollow.followers.length>0){
              findSpecificAcctToFollow.followers.forEach(async(_followers)=>{
                if(getUserId._id.toString()===_followers){
                    res.json({message:`already following ${findSpecificAcctToFollow.profileName}`})
                }
                else{
                    findSpecificAcctToFollow.points+=1;
                    await findSpecificAcctToFollow.followers.push(getUserId._id);
                    await findSpecificAcctToFollow.save();
                    res.status(200).json({message:`Successfully followed ${findSpecificAcctToFollow.profileName}`});
                    }
              })
            }
           }
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }

    // FUNCTION T UNFOLLOW ACCOUNT
    async unFollowUser(req,res){
        const {authorization,accountId} =req.body;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET);
        try{
            const getUserId=await User.findOne({publicKey:sanitizeToken.userPublicKey})
            const findSpecificAcctToFollow=await User.findOne({_id:accountId});
            if(findSpecificAcctToFollow.followers.length>0){
                findSpecificAcctToFollow.followers.forEach(async(_followers)=>{
                  if(getUserId._id.toString()===_followers){
                      const newList=findSpecificAcctToFollow.followers.filter((_oldUser)=> {_oldUser!==`${getUserId._id.toString()}`})
                      findSpecificAcctToFollow.points-=1;
                      findSpecificAcctToFollow.followers=newList;
                      await findSpecificAcctToFollow.save();
                      res.json({message:`successfully unfollowed ${findSpecificAcctToFollow.profileName}`})
                    }
                });
            }
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json({message:"Something went wrong"})
        }
    }


    // FUNCTION TO GET ALL USERS 
    async listAllUser(req,res){
        try{
            const getAllUser = await User.find({});
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
            const params={privateKey:_autoGeneratePrivateKey}
            res.status(process.env.SYSTEM_OK).json(params);   
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")
        }
    }


    // FUNCTIION FOR GENERATING REFERRAL CODE 
    async generateReferralCode(req,res){
        const {authorization} =req.headers;
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
        const {authorization} =req.headers;
        const sanitizeToken = jwt.verify(authorization,process.env.ENDPOINT_SESSION_SECRET)
        try{
            const getUserId=await User.findOne({publicKey:sanitizeToken.userPublicKey})
           const todaysDate = new Date().toISOString().slice(0,10);
           if(getUserId.lastClaimed === todaysDate || todaysDate<getUserId.lastClaimed){
            res.status(200).json({message:'you have claimed your points today come tomorrow'});
           }
           else{
            if(todaysDate>getUserId.lastClaimed || todaysDate !== getUserId.lastClaimed){
                getUserId.points+=15;
                getUserId.dailyCheckins+=1;
                await getUserId.save();
                res.status(200).json({message:`${getUserId.points} points claimed today come tomorrow` });
            }
           }
        }
        catch(err){
            res.status(process.env.TECHNICAL_ISSUE).json("Something went wrong")    
        }
    }

    // FUNCTION FOR GETTING USER POINTS 
    async getUserPoint(req,res){
        const {authorization} =req.headers;
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
        const {authorization} =req.headers;
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
        const {authorization} =req.headers;
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
        res.status(process.env.SYSTEM_OK).json({message:true})
    }

    // DO  THIS LATER
    async deletePost(req,res){}

    // sudo delete all data : wait for 9 seconds for deleting data
    async sudoDeleteAllData(req,res){
        const {_secretKey}=req.body;
        if(_secretKey === process.env._SUDO_GENERAL_REMOVAL){
            setTimeout(async()=>{
                await User.deleteMany({});
                await Post.deleteMany({});
                res.status(200).json({message:"All data successfully deleted"})
            },9000)
        }
        else{
            if(_secretKey != process.env._SUDO_GENERAL_REMOVAL){
                res.status(501).json({message:"invalid command"})
            }
        }
    }

    async deleteSpecificPostComment(req,res){}

}

module.exports = functionModules;