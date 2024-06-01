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
    }
});

export const Post = model('Posts',postSchema);