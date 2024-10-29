require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { userCollection, eventCollection } = require('./mongo');
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

app.use("/users", usersRoute);
app.use("/create-user", createUserRoute);
app.use("/login", loginRoute);
app.use("/reset-password", resetPasswordRoute);
app.use("/complete-profile", completeProfileRoute);
app.use("/delete-user/", deleteUserRoute);
app.use("/user-profile/", userProfileRoute);
app.use("/update-profile/", updateProfileRoute);
app.use("/create-event", createEventRoute);
/*END OF NEW STUFF*/


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



