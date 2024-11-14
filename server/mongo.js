require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@orangefrog.xmt6e.mongodb.net/?retryWrites=true&w=majority&appName=OrangeFrog`;

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(() => {
        console.error("Failed to connect to MongoDB");
    });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    dob: { type: Date },
    allergies: [{ type: String }], // Stores allergies as an array
    foodAllergyDetail: { type: String },
    extraComments: { type: String },
    temporaryPassword: { type: Boolean, default: true },
    status: { type: String, default: 'pending' },
    phone: { 
        type: String,
        validate: {
            validator: function(v) {
                return /^\(\d{3}\) \d{3}-\d{4}$/.test(v); // Example format: (000) 000-0000
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    height: {
        feet: { type: Number, min: 1, max: 9 },
        inches: { type: Number, min: 0, max: 11 }
    },
    gender: { type: String }
});

const userCollection = mongoose.model('userCollection', userSchema);


const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventLoadIn: { type: Date, required: true },
    eventLoadOut: { type: Date, required: true },
    eventLocation: { type: String, required: true },
    eventHours: { type: Number },
    eventDescription: { type: String },
    assignedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }] 
});
  
const eventCollection = mongoose.model('eventCollection', eventSchema);

const collection = {
    userCollection,
    eventCollection
};

module.exports = collection;
