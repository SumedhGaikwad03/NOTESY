import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim :true
    },
    createdBy:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required:true
    },
    createdat:{
        type:Date,
        default:Date.now
    }, 
    members :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
],

},

{
    timestamps:true,

}
);

const Room = mongoose.model("Room",RoomSchema);

export default Room;