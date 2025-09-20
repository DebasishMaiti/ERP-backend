import * as dotenv from "dotenv";
import express from "express";
import routes from "./routes/routes";
import { connectToDatabase } from "./database/config";
import cors from "cors"

dotenv.config(); 

const app = express();

app.use(express.json())
app.use(cors())

const port = process.env.ERP_PORT || 3000;

app.use("/api", routes);


app.get('/', (req, res) => {
    res.send('Hello from TypeScript Express Server!');
});

app.listen(port,  async() => {
    await connectToDatabase();
    console.log(`Server is running on http://localhost:${port}`);
});