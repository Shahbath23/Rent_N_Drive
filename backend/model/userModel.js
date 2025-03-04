import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:  String,
    password: String, 
    email:String,
    phoneNo:String,
    role: { type: String, enum: ["customer", "owner", "admin"], default: "customer" },
    isApproved:{type:Boolean,default:false},
    proofOfLicense:String,
    profilePicture:String,
    latitude:Number,
    longitude:Number,
    address:String,
  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model("User", userSchema);

export default User;
