const mongooseModel = require("../dbConfig/db");

const postModel = new mongooseModel.Schema({
        postOwnerId:{type:String},
        profilePics:{type:String},
        profileName:{type:String},
        content:{type:String},
        media:{
            audio:[{type:String}],
            photos:[{type:String}]
        },
        upVoteReaction:{type:Number,default:0},
        downVoteReaction:{type:Number,default:0},
        timePosted:{type:String},
        comments:[
            {
                userId:{type:String},
                content:{type:String},
                timeCommented:{type:String}
            }
        ]
    })

const Post = mongooseModel.model("Post",postModel);

module.exports = {Post}