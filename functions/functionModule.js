require("dotenv").config();
const {User} = require("../models/user.model");
const {utilHelper} = require("../utils/utilHelper");

class functionModules{

    async createNewAccount(req,res){
        const {profileName,privateKey,ambientColor}=req.body;
        const convertPrivToPub=utilHelper.generateUserPublicKey(privateKey)

        try{
            const checkPrivateKeyExist=await User.findOne({publicKey:convertPrivToPub});
            if(checkPrivateKeyExist){
                res.status(200).json({message:"account already exist"})
            }
            else{

                if(! checkPrivateKeyExist){                    
            // # check whether public key is available
            const data={
            profileName:profileName,
            publicKey:convertPrivToPub,
            ambientColor: ambientColor 
            }
        }
    }
}
        catch(exception){
            res.status(503).json({error:'Something went wrong'})
        }
    }

    async importAccount(req,res){}

    async postContent(req,res){}

    async toggleReactOnPost(res,res){}

    async commentOnPost(req,res){}

    async listAllPost(req,res){}

    async toggleFollowUser(req,res){}

    async listAllUser(req,res){}

    async getAllFollowers(req,res){}

    async listAllUserSpecificPost(res,req){}
    
    async getSpecificPost(req,res){}

    async generateReferralCode(req,res){}

    async signupViaReferral(req,res){}

    async performDailyCheckin(req,res){}

    async getUserPoint(req,res){}

    async getUserData(req,res){}

    async getAllReferrals(req,res){}

    async deletePost(req,res){}

    async deleteSpecificPostComment(req,res){}

}

module.exports = functionModules;