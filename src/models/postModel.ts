import { model, Schema, Types } from "mongoose";

const postSchema = new Schema({
    postTitle:{
        type:String,
        required:true
    },
    postDescription:{
        type:String,
        required:true
    },
    authorId:{
        type:Types.ObjectId,
        ref:'Users',
        required:true
    },
    comments:[{
        type: Types.ObjectId,
        ref: 'Comments'
    }],
    likes:[{
        type: Types.ObjectId, 
        ref: 'Users'
    }],
    reports:[{
        type: Types.ObjectId,
        ref: 'Comments'
    }],
    hideFrom: [{
        type: Types.ObjectId,
        ref: 'Users'
    }]
});

export const Post = model('Posts',postSchema);