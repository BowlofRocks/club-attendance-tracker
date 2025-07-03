import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import membersRoutes from "./routes/members.js";
import subscriptionsRoutes from "./routes/subscriptions.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/members", membersRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
