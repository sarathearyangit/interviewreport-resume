const pdfParse = require("pdf-parse")
const {generateInterviewReport, generateResumePdf } = require("../services/aiService")
const interviewReportModel = require("../models/interviewReportModel")


/* generate new interview report */

async function generateInterviewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription?.trim()) {
            return res.status(400).json({
                message: "Job description is required."
            });
        }

        // Resume is optional if self-description is provided.
        let resumeText = "";

        if (req.file) {
            const parser = new pdfParse.PDFParse(
                Uint8Array.from(req.file.buffer)
            );

            const resumeContent = await parser.getText();
            resumeText = resumeContent.text || "";
        }

        if (!resumeText.trim() && !selfDescription?.trim()) {
            return res.status(400).json({
                message: "Please upload a resume or provide a self-description."
            });
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        // Extract title from common job-description formats.
        const titleMatch = jobDescription.match(
            /(?:Job\s*Title\s*[:=]\s*)?(?:Position\s*:\s*)([^\r\n]+)/i
        ) || jobDescription.match(
            /Job\s*Title\s*[:=]\s*([^\r\n]+)/i
        );

        const extractedTitle = titleMatch?.[1]?.trim();

        const title =
            interviewReportByAi?.title?.trim() ||
            extractedTitle;

        if (!title) {
            return res.status(400).json({
                message: "Could not identify the job title. Include 'Job Title: Backend Developer' in the job description."
            });
        }

        const interviewReport = await interviewReportModel.create({
            ...interviewReportByAi,
            title,
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        return res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });

    } catch (error) {
        console.error("Generate interview report error:", error);

        return res.status(500).json({
            message: "Failed to generate interview report.",
            error: error.message
        });
    }
}



/* get interview report by interviewId*/
async function getInterviewReportByIdController(req, res){

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewId, 
        user: req.user.id
    })

    if(!interviewReport){
        return res.status(404).json({
            message :"Interview report not found."
        })
    }

    return res.status(200).json({
        message :"Interview report fetched successfully.",
        interviewReport
    })
}


/* get all interview report pf logged in user*/
async function getAllInterviewReportsController(req, res){

    const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -skillGaps -preparationPlan")
    .sort({ createdAt: -1 })

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

/* Controller to generate resume PDF based on user self description, resume and job description.  */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}


module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController,
    generateResumePdfController
 }