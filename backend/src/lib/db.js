import mongoose from 'mongoose';


export const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB connected ${conn.connection.host}`);
    }catch(error){
        console.error("MongoDB connection failed");
        console.error(error);
    }
}
// export default async function connectDB() {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             useCreateIndex: true,
//         });
//         console.log("MongoDB connected successfully");
//     } catch (error) {
//         console.error("MongoDB connection failed");
//         console.error(error);
//     }
// }