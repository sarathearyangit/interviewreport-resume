const express = require("express")
const { authUser } = require("../middleware/authMiddleware")
const { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController } = require("../controllers/interviewController")
const upload = require("../middleware/fileMiddleware")

const interviewRouter = express.Router()


interviewRouter.post("/", authUser, upload.single("resume"), generateInterviewReportController)

interviewRouter.get("/report/:interviewId", authUser, getInterviewReportByIdController)


/* api/inter */
interviewRouter.get("/", authUser, getAllInterviewReportsController)

interviewRouter.post("/resume/pdf/:interviewReportId", authUser, generateResumePdfController)

module.exports = interviewRouter