import express from "express";
import cors from "cors";
import candidatesRouter from "./routes/candidates.js";
import clientsRouter from "./routes/clients.js";
import teamMembersRouter from "./routes/teamMembers.js";
import settingsRouter from "./routes/settings.js";
import performanceRouter from "./routes/performance.js";
import overridePayoutsRouter from "./routes/overridePayouts.js";
import servicesRouter from "./routes/services.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"] }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/candidates", candidatesRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/team-members", teamMembersRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/performance-records", performanceRouter);
app.use("/api/override-payout-records", overridePayoutsRouter);
app.use("/api/services", servicesRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log("CRM backend running on http://localhost:" + PORT);
});
