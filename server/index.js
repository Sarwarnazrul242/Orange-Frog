require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { userCollection, eventCollection } = require('./mongo');
const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));


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

app.use("/users", usersRoute);
app.use("/update-user", userProfileRoute);
app.use("/create-user", createUserRoute);
app.use("/resend-email", createUserRoute);
app.use("/login", loginRoute);
app.use("/reset-password", resetPasswordRoute);
app.use("/complete-profile", completeProfileRoute);
app.use("/delete-user/", deleteUserRoute);
app.use("/user-profile/", userProfileRoute);
app.use("/update-profile/", updateProfileRoute);
app.use("/create-event", createEventRoute);
app.use("/events", eventsRoute);
app.use("/incident-report", incidentReportRoute);
app.use("/forgot-password", forgotPasswordRoute);
/*END OF NEW STUFF*/


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


const url = `https://orange-frog-server.onrender.com/`; // Replace with your Render URL
const interval = 30000; // Interval in milliseconds (30 seconds)

function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}


setInterval(reloadWebsite, interval);
