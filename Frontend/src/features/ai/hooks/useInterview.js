import { useCallback, useContext, useEffect } from "react"
import { getInterviewReportById, generateInterviewReport, getAllInterviewReports, generateResumePdf } from "../services/interviewApi"
import { InterviewContext } from "../interviewContext"
import { useParams } from "react-router-dom"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {

        setLoading(true)

        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            const interviewReport = response?.interviewReport;

            if (!interviewReport) {
                throw new Error(
                    "Interview report was not found in the API response"
                );
            }

            setReport(interviewReport);

            return interviewReport;

        } catch (error) {
            console.error(
            "Failed to generate interview report:",
            error.response?.data || error.message
        );

        throw error;
        
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)

        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error(
                "Report fetch failed:",
                error.response?.data || error.message
            )
            setReport(null)
            return null
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])


    const getReports = async () => {

        setLoading(true)
        let response = null

        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReports ?? []
    }


    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if(interviewId){
            getReportById(interviewId)
        }else {
            getReports()
        }
    },[interviewId])



    return { loading, report, reports, generateReport, getReports, getReportById, getResumePdf }
}
