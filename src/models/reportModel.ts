import { model, Schema, Types } from "mongoose";

const reportSchema = new Schema({
    reportDescription:{
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

export const Report = model('Reports',reportSchema);