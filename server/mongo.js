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
    hourlyRate: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending' },
    address: { type: String, default: '' },
    dob: { type: Date, default: null },
    allergies: { type: [String], default: [] },
    phone: { type: String, default: '' },
    shirtSize: { 
        type: String,
        default: '',
        enum: ['', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    firstAidCert: {
        type: String,
        default: '',
        enum: ['', 'Yes', 'No']
    },
    temporaryPassword: { type: Boolean, default: true },
});

const userCollection = mongoose.model('userCollection', userSchema);

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventLoadIn: { type: Date, required: true },
    eventLoadOut: { type: Date, required: true },
    eventLocation: { type: String, required: true },
    eventHours: { type: Number },
    eventDescription: { type: String },
    assignedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }],
    eventStatus: { type: String, enum: ['published', 'processing', 'started', 'completed', 'canceled'], default: 'published' },
    acceptedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }],
    rejectedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }],
    approvedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }]
});

const eventCollection = mongoose.model('eventCollection', eventSchema);

const incidentSchema = new mongoose.Schema({
    incidentName: { type: String, required: true },
    incidentStartDate: { type: Date, required: true },
    incidentEndDate: { type: Date, required: true },
    incidentRequest: { type: String },
    incidentDescription: { type: String, required: true }
});

const incidentCollection = mongoose.model('incidentCollection', incidentSchema);

const collection = {
    userCollection,
    eventCollection,
    incidentCollection
};

module.exports = collection;
