const mongoose = require('mongoose');
const validator = require("validator");
const slugify = require("slugify");
const { faker } = require('@faker-js/faker');

const jobSchema = new mongoose.Schema({
    title : {
        type: String,
        required : [true, 'Please enter Job title'],
        trim: true,
        maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    slug : String,
    description: {
        type: String,
        required: [true, 'Please enter Job description'],
        maxlength: [1000, 'Job description cannot be more than 1000 characters']
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please add a valid email address']
    },
    address : {
        type: String,
        required: [true, 'Please add an address. ']
    },

    location : {
        type : {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: "2dsphere"
        },
        formattedAddress: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    company: {
        type: String,
        required: [true, 'Please add Company name']
    },
    industry: {
        type: [String],
        required: [true, "Please enter industry for this job"],
        enum : {
            values : [
                "Business",
                "Information Technology",
                "Banking",
                "Education/Training",
                "Telecommunication",
                "Others"
            
            ],
            message : 'Please select correct options for industry'
        }
    },
    jobType: {
        type: String,
        required: [true, "Please enter the job type"],
        enum : {
            values : [
                "Permanent",
                "Temporary",
                "Internship"
            ],
            message : "Please select correct options for job type."
        }
    },
    minEducation : {
        type: String,
        required: [true, "Please enter minimum qualification for this job"],
        enum: {
            values: [
                "Bachelors",
                "Masters",
                "Phd"
            ],
            message: "Please select correct options"
        }
    },
    positions: {
        type: Number,
        default: 1
    },

    experience : {
        type: String,
        required:[true, "Please enter experience required for this job"],
        enum : {
            values : [
                "No experience",
                "1 Year - 2 Years",
                "2 Years - 5 Years",
                "5 Years+"
            ],
            message: "Please select correct options"
        }
    },
    salary: {
        type: Number,
        required: [true, "Please enter expected salary for this job"]
    },
    postingDate: {
        type: Date,
        default: Date.now
    },

    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate()+7)
    },
    applicantsApplied: {
        type: [Object],
        select: false
    },
    user : {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
});

// creating job slug before save,
jobSchema.pre("save", function(next){
    // creating slub before saving to DB
    this.slug = slugify(this.title, {lower: true});
    next();
})

// setting up location

jobSchema.pre('save', async function(){
    this.location = {
        type: "Point",
        coordinates : [faker.address.longitude(), faker.address.latitude()],
        formattedAddress : faker.address.streetAddress(),
        city: faker.address.cityName(),
        state: faker.address.state(),
        zipcode: faker.address.zipCode(),
        country: faker.address.countryCode()
    }
})


module.exports = mongoose.model("Job", jobSchema);





