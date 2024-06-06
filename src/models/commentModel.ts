import { model, Schema, Types } from "mongoose";

const commentSchema = new Schema({
    commentDescription:{
        type:String,
        required:true
    },
    authorId:{
        type:Types.ObjectId,
        ref:'Users',
        required:true
    },
    postId:{
        type: Types.ObjectId,
        ref: 'Posts',
        required: true
    }
});

export const Comment = model('Comments',commentSchema);