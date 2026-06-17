import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${DB_NAME}`);

    console.log(`MongooDb connected!! ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`Connection Failed ! , ${error}`);
    process.exit(1)
  }
};
export default connectDb

//try { connect instance = await mongoose.conect(
//${DBURL}/${DBNAME} )
//console.log(instance.connection.host)
//} catch (error) {
// process.exit(1) 
//}