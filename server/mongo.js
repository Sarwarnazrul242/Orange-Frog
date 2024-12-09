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
    eventLoadInHours: { type: Number, required: true },
    eventLoadOut: { type: Date, required: true },
    eventLoadOutHours: { type: Number, required: true },
    eventLocation: { type: String, required: true },
    eventDescription: { type: String },
    assignedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }],
    eventStatus: { type: String, enum: ['published', 'processing', 'started', 'completed', 'canceled'], default: 'published' },
    acceptedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }],
    rejectedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }],
    approvedContractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userCollection' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const eventCollection = mongoose.model('eventCollection', eventSchema);



const correctionReportSchema = new mongoose.Schema({
    reportTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    requestType: { type: String, required: true },
    description: { type: String, required: true },
    requestedCorrection: { type: String, required: true },
    files: [{ type: String }],
    status: { type: String, default: 'pending' },
    submittedAt: { type: Date, default: Date.now }
});

const correctionReportCollection = mongoose.model('correctionReportCollection', correctionReportSchema);

const collection = {
    userCollection,
    eventCollection,
    correctionReportCollection
};

module.exports = collection;
