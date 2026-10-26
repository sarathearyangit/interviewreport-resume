const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GEN_AI_API
});


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between the 0 and 100 indicating how well the candidate profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical questions can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question what points to cover, what approach to take etc")
    })).describe("Technical questions that can be asked in the interview along with the intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical questions can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question what points to cover, what approach to take etc")
    })).describe("Behavioral questions that can be asked in the interview along with the intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job")
    })).describe("List of skill gaps in the candidate profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan starting from"),
        focus: z.string().describe("The main focus of this day in the preparation plan e.g. data structures, system design, mock interview"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan e.g. read a specific book")
    })).describe("A day wise preparation plan for the candidate to follow in order to prepare for the interview effective"),
    title: z.string().describe("The title of the job for which the interview report is generated")
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate with the following details:
    1. matchScore: A number from 0 to 100.
2. technicalQuestions: An array of technical interview questions.
   Each item must contain question, intention, and answer.
3. behavioralQuestions: An array of behavioral interview questions.
   Each item must contain question, intention, and answer.
4. skillGaps: An array of missing or weak skills.
   Each item must contain skill and severity (low, medium, or high).
5. preparationPlan: A day-wise preparation plan.
   Each item must contain day, focus, and tasks.
    Resume: ${resume}
    Self Description: ${selfDescription}
    Job Description: ${jobDescription}
    `

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    matchScore: {
                        type: "NUMBER"
                    },
                    technicalQuestions: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                question: { type: "STRING" },
                                intention: { type: "STRING" },
                                answer: { type: "STRING" }
                            },
                            required: ["question", "intention", "answer"]
                        }
                    },
                    behavioralQuestions: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                question: { type: "STRING" },
                                intention: { type: "STRING" },
                                answer: { type: "STRING" }
                            },
                            required: ["question", "intention", "answer"]
                        }
                    },
                    skillGaps: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                skill: { type: "STRING" },
                                severity: {
                                    type: "STRING",
                                    enum: ["low", "medium", "high"]
                                }
                            },
                            required: ["skill", "severity"]
                        }
                    },
                    preparationPlan: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                day: { type: "NUMBER" },
                                focus: { type: "STRING" },
                                tasks: {
                                    type: "ARRAY",
                                    items: { type: "STRING" }
                                }
                            },
                            required: ["day", "focus", "tasks"]
                        }
                    }
                },
                required: [
                    "matchScore",
                    "technicalQuestions",
                    "behavioralQuestions",
                    "skillGaps",
                    "preparationPlan"
                ]
            }
        }
    });
    return JSON.parse(response.text)
}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        return await page.pdf({ format: "A4" });
    } finally {
        await browser.close();
    }
}



async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}

                    the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                `

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    const jsonContent = JSON.parse(response.text)

    //Convert HTML to PDF using puppeteer
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}


module.exports = {generateInterviewReport, generateResumePdf };
