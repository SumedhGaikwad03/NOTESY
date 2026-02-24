import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({ 

    room:{
        type :mongoose.Schema.Types.ObjectId,
        ref:'Room',
        required:true,
        index:true
    },
    text:{
        type : String,
        required:true,
        trim:true,
        maxlength:200
    },
    completed :{
        type : Boolean,
        default:false
    },
    createdBy :{
        type :mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    completedAt :{
        type : Date,
        default:null
    }
},{
    timestamps:true
});

export default mongoose.model('Task',taskSchema);
    