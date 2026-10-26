const mongoose = require("mongoose")

/*  Input ---
job description schema
resume text
self description

Output --
match-score
Technical Q. : []
behavioral Q. : []
skills gap : []
preparation plan : [ ]
*/

const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is req"]
    },
    intention: {
        type: String,
        required: [true, "Intention is req"]
    },
    answer: {
        type: String,
        required: [true, "Answer is req"]
    }
}, {
    _id: false
})


const behavioralQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is req"]
    },
    intention: {
        type: String,
        required: [true, "Intention is req"]
    },
    answer: {
        type: String,
        required: [true, "Answer is req"]
    }
}, {
    _id: false
})


const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is req"]
    },
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [true, "Severity is req"]
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }]
})


//Main Schema
const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job description is req"]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [technicalQuestionsSchema],
    behavioralQuestions: [behavioralQuestionsSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Uer"
    },
    title: {
        type: String,
        required: [true, "Job title is required"]
    }
}, {
    timestamps: true
})

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema)

module.exports = interviewReportModel;