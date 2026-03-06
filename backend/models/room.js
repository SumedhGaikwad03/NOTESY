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
RoomSchema.pre("findOneAndDelete", async function (next) {

  const room = await this.model.findOne(this.getFilter());

  if (room) {
    await mongoose.model("Note").deleteMany({ roomId: room._id });
    await mongoose.model("Task").deleteMany({ roomId: room._id });
  }

  next();
});


const Room = mongoose.model("Room",RoomSchema);

export default Room;