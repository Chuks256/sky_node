const dbModule = require("../dbConfig/db");

const postModel = new dbModule.Schema({
        postOwnerId:{type:String},
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

const Post = dbModule.model("Post",postModel);

module.exports = {Post}