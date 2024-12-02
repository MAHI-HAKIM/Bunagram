import express from 'express';
import authRoutes from "./routes/auth.routes.js";

const port = 5001;

const app = express();

app.use("/api/auth",authRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});