import { model, Schema } from "mongoose";

const verificationSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    OTP:{
        type: String,
        required: true
    },
    token:{
        type: String,
        required: true
    }
})

export const Verification = model('Verification',verificationSchema);