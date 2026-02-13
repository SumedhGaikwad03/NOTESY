import mongoose from "mongoose"; 
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    passwordChangedAt: {
        type: Date,
      },

},
{timestamps:true}
);

UserSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    if(!this.isNew){
        this.passwordChangedAt = Date.now() - 1000; // set passwordChangedAt to current time minus 1sec 
        // to ensure token is always created after password has been changed
    }
    next();


});

const User = mongoose.model("User",UserSchema);

export default User;