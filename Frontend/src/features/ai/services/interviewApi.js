import axios from "axios"

const api = axios.create({
    baseURL: "https://interviewreport-resume-backend.onrender.com",
    withCredentials: true,
})


/* service to generate report */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()

    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}


/* service to get interview report by interviewId */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/* service to get all interview report of logged iin user */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}
