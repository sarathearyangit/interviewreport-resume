
import React, { useRef, useState } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeFile, setResumeFile] = useState(null)

    const resumeInputRef = useRef(null)
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ]

        const isValidType =
            allowedTypes.includes(file.type) ||
            /\.(pdf|doc|docx)$/i.test(file.name)

        if (!isValidType) {
            alert("Please upload a PDF or DOCX file.")
            e.target.value = ""
            setResumeFile(null)
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB.")
            e.target.value = ""
            setResumeFile(null)
            return
        }

        setResumeFile(file)
    }

    const removeFile = () => {
        setResumeFile(null)

        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    const handleGenReport = async () => {
        if (!jobDescription.trim()) {
            alert("Please enter the target job description.")
            return
        }

        if (!resumeFile && !selfDescription.trim()) {
            alert("Please upload a resume or enter your self-description.")
            return
        }

        try {
            const interviewReport = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile
            })

            if (interviewReport?._id) {
                navigate(`/interview/${interviewReport._id}`)
            } else {
                console.error("Interview report ID is missing.")
            }
        } catch (error) {
            console.error(
                "Failed to generate interview report:",
                error.response?.data || error.message
            )
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <main className='home'>
            <section
                className='interview-builder'
                aria-labelledby='interview-title'
            >
                <header className='builder-heading'>
                    <h1 id='interview-title'>
                        Create Your Custom <span>Interview Plan</span>
                    </h1>

                    <p>
                        Let our AI analyze the job requirements and your unique profile to
                        <br className='desktop-break' /> build a winning strategy.
                    </p>
                </header>

                <div className='interview-input-group'>
                    <section
                        className='job-panel'
                        aria-labelledby='job-heading'
                    >
                        <div className='field-heading'>
                            <label
                                id='job-heading'
                                htmlFor='jobDescription'
                            >
                                <span
                                    className='heading-icon job-icon'
                                    aria-hidden='true'
                                ></span>
                                Target Job Description
                            </label>

                            <span className='required-badge'>REQUIRED</span>
                        </div>

                        <textarea
                            onChange={(e) => setJobDescription(e.target.value)}
                            value={jobDescription}
                            name='jobDescription'
                            id='jobDescription'
                            maxLength={5000}
                            placeholder={'Paste the full job description here...\ne.g. Frontend Engineer requires proficiency in React, TypeScript, and system design.'}
                        />

                        <span className='character-count'>
                            {jobDescription.length} / 5000 chars
                        </span>
                    </section>

                    <section
                        className='profile-panel'
                        aria-labelledby='profile-heading'
                    >
                        <div className='field-heading profile-title'>
                            <h2 id='profile-heading'>
                                <span
                                    className='heading-icon profile-icon'
                                    aria-hidden='true'
                                ></span>
                                Your Profile
                            </h2>
                        </div>

                        <div className='input-group resume-group'>
                            <div className='subheading-row'>
                                <label htmlFor='resume'>Upload Resume</label>
                                <span className='optional-badge'>BEST RESULTS</span>
                            </div>

                            <input
                                ref={resumeInputRef}
                                hidden
                                type='file'
                                name='resume'
                                id='resume'
                                accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                onChange={handleFileChange}
                            />

                            {!resumeFile ? (
                                <label
                                    className='file-label'
                                    htmlFor='resume'
                                >
                                    <span
                                        className='upload-icon'
                                        aria-hidden='true'
                                    ></span>

                                    <strong>
                                        Click to upload or drag &amp; drop
                                    </strong>

                                    <small>PDF or DOCX (max 5MB)</small>
                                </label>
                            ) : (
                                <div className='selected-file'>
                                    <div className='selected-file-icon'>
                                        {resumeFile.name.toLowerCase().endsWith('.pdf')
                                            ? 'PDF'
                                            : 'DOC'}
                                    </div>

                                    <div className='selected-file-details'>
                                        <strong title={resumeFile.name}>
                                            {resumeFile.name}
                                        </strong>

                                        <small>
                                            {formatFileSize(resumeFile.size)}
                                        </small>

                                        <span className='upload-success'>
                                            ✓ File selected successfully
                                        </span>
                                    </div>

                                    <button
                                        type='button'
                                        className='remove-file-button'
                                        onClick={removeFile}
                                        aria-label='Remove selected resume'
                                        title='Remove file'
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {resumeFile && (
                                <button
                                    type='button'
                                    className='change-file-button'
                                    onClick={() => resumeInputRef.current?.click()}
                                >
                                    Change file
                                </button>
                            )}
                        </div>

                        <div className='divider'>
                            <span>OR</span>
                        </div>

                        <div className='input-group description-group'>
                            <label htmlFor='selfDescription'>
                                Quick Self-Description
                            </label>

                            <textarea
                                onChange={(e) => setSelfDescription(e.target.value)}
                                value={selfDescription}
                                name='selfDescription'
                                id='selfDescription'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <div className='info-note'>
                            <span className='info-icon'>i</span>
                            <span>
                                Either a <strong>Resume</strong> or a
                                <strong> Self Description</strong> is required
                                to generate a personalized plan.
                            </span>
                        </div>
                    </section>


                    {/* footer section */}
                    <div className='builder-footer'>
                        <p>
                            AI-Powered Strategy Generation <span>|</span> Approx. 30s
                        </p>

                        <button
                            onClick={handleGenReport}
                            className='button primary-button'
                            disabled={loading}
                        >
                            {loading
                                ? "Generating Report..."
                                : "Generate My Interview Strategy"}
                        </button>
                    </div>
                </div>

                {/* recent reports lists */}
                {reports.length > 0 && (
                        <section className='recent-reports'>
                            <h2>My Recent Interview Plans</h2>
                            <ul className='reports-list'>
                                {reports.map(report => (
                                    <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                        <h3>{report.title || 'Untitled Position'}</h3>
                                        <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                        <p className={`match-score ${report.matchScore >=80 ? 'score-high' : report.matchScore >=60 ? 'score-mid' : 'score-low' }`}>Match Score: {report.matchScore}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                )} 


                {/* footer */}
                <footer>
                    
                </footer>
            </section>

            
        </main>
    )
}

export default Home