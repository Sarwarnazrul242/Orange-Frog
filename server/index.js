require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { userCollection, eventCollection, Admin } = require('./mongo');
const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use(cors());


/*NEW STUFF*/
const usersRoute = require("./routes/users");
const createUserRoute = require("./routes/create-user");
const loginRoute = require("./routes/login");
const resetPasswordRoute = require("./routes/reset-password");
const completeProfileRoute = require("./routes/complete-profile");
const deleteUserRoute = require("./routes/delete-user");
const userProfileRoute = require("./routes/user-profile");
const updateProfileRoute = require("./routes/update-profile");
const createEventRoute = require("./routes/create-event");
const eventsRoute = require("./routes/events");
const incidentReportRoute = require("./routes/incident-report");
const forgotPasswordRoute = require("./routes/forgot-password");
const logoutRoute = require("./routes/logout");
const correctionReportRouter = require('./routes/correction-report');
const invoicesRoute = require('./routes/invoices');
const viewCorrectionsRoute = require("./routes/view-corrections");
const adminRoutes = require("./routes/admin");

app.use("/users", usersRoute);
app.use("/update-user", userProfileRoute);
app.use("/create-user", createUserRoute);
app.use("/resend-email", createUserRoute);
app.use("/login", loginRoute);
app.use("/reset-password", resetPasswordRoute);
app.use("/complete-profile", completeProfileRoute);
app.use("/delete-user/", deleteUserRoute);
app.use("/user-profile/", userProfileRoute);
app.use("/update-profile", updateProfileRoute);
app.use("/create-event", createEventRoute);
app.use("/events", eventsRoute);
app.use("/incident-report", incidentReportRoute);
app.use("/forgot-password", forgotPasswordRoute);
app.use("/logout", logoutRoute);
app.use('/correction-report', correctionReportRouter);
app.use('/invoices', invoicesRoute);
app.use("/corrections", viewCorrectionsRoute);

app.use("/admin", adminRoutes);

app.use("/health", (req, res) => {
  res.status(200).send("App is running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




