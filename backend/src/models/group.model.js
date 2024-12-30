import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    groupName:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    participants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    groupImage:{
        type: String,
        default: ""
    },
    publicKey:{
        type: String,
        required: true
    },
    privateKey:{
        type: String,
        required: true
    }
})

const Group = mongoose.model('Group' , groupSchema);

export default Group;