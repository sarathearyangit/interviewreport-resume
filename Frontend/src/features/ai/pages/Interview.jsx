import React, { useEffect, useState } from 'react'
import "../style/interview.scss"
import { useInterview } from '../hooks/useInterview'
import { useNavigate, useParams } from 'react-router-dom'



const QuestionCard = ({ item, index }) => (
    <article className='question-card'>
        <div className='question-number'>Q{String(index + 1).padStart(2, '0')}</div>
        <div className='question-copy'>
            <h3>{item.question}</h3>
            <div className='question-detail intention-detail'>
                <span className='detail-label'>Intention</span>
                <p>{item.intention}</p>
            </div>
            <div className='question-detail answer-detail'>
                <span className='detail-label'>Answer</span>
                <p>{item.answer}</p>
            </div>
        </div>
    </article>
)

const Interview = () => {

    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()
    const [reportNotFound, setReportNotFound] = useState(false)

    useEffect(() => {
        let isCurrent = true

        if (!interviewId) {
            setReportNotFound(true)
            return () => { isCurrent = false }
        }

        setReportNotFound(false)
        getReportById(interviewId).then((loadedReport) => {
            if (isCurrent) setReportNotFound(!loadedReport)
        })

        return () => { isCurrent = false }
    }, [interviewId, getReportById])

    if (loading) {
        return(
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    if (reportNotFound || !report) {
        return (
            <main className='loading-screen'>
                <h1>We couldn’t load this interview plan.</h1>
                <p>The report may have been deleted, or your session may have expired.</p>
                <button type='button' onClick={() => navigate('/')}>Back to home</button>
            </main>
        )
    }

    const scoreTone = report.matchScore > 70 ? 'green' : report.matchScore >= 50 ? 'yellow' : 'red'

    const scoreTitle = report.matchScore > 70 ? 'Strong alignment' : report.matchScore >= 50 ? 'Moderate alignment' : 'Needs improvement'

    const scoreDescription = report.matchScore > 70
        ? 'Your experience is a strong match for this role. Focus your prep on the skills below.'
        : report.matchScore >= 50
            ? 'Your profile has a good foundation. Strengthen the focus areas below to improve your match.'
            : 'Focus on the preparation plan and skill gaps below to build a stronger match for this role.'

    return (
        <main className='interview-page'>
            <aside className='report-sidebar' aria-label='Report sections'>
                <a className='report-brand' href='#report-top' aria-label='Interview plan home'><span className='brand-mark'>I</span><span>Interview<span className='brand-accent'>AI</span></span></a>
                <span className='sidebar-label'>YOUR PLAN</span>
                <nav className='report-nav'>
                    <a href='#technical-questions'><span className='nav-mark'>T</span><span>Technical questions</span><span className='nav-count'>{report.technicalQuestions.length}</span></a>
                    <a href='#behavioral-questions'><span className='nav-mark'>B</span><span>Behavioral questions</span><span className='nav-count'>{report.behavioralQuestions.length}</span></a>
                    <a href='#preparation-roadmap'><span className='nav-mark'>R</span><span>Road map</span></a>
                    <button onClick={() => {getResumePdf(interviewId) }} className='button primary-button resume-button'>Generate Resume</button>                    
                </nav>

            </aside>

            <div className='report-main' id='report-top'>
                <header className='report-header'>
                    <div>
                        <span className='report-eyebrow'>PERSONALIZED INTERVIEW PREP</span>
                        <h1>Your Interview Plan</h1>
                        <p>A focused guide to help you prepare with confidence.</p>
                    </div>
                    <span className='ready-badge'><span></span> Ready to practice</span>
                </header>

                <section className='report-section' id='technical-questions'>
                    <div className='section-heading'><div><span className='section-kicker'>01 / TECHNICAL</span><h2>Technical questions</h2></div><span className='section-count'>{report.technicalQuestions.length} questions</span></div>
                    <div className='question-list'>{report.technicalQuestions.map((item, index) => <QuestionCard key={`technical-${index}`} item={item} index={index} />)}</div>
                </section>

                <section className='report-section' id='behavioral-questions'>
                    <div className='section-heading'><div><span className='section-kicker'>02 / BEHAVIORAL</span><h2>Behavioral questions</h2></div><span className='section-count'>{report.behavioralQuestions.length} questions</span></div>
                    <div className='question-list'>{report.behavioralQuestions.map((item, index) => <QuestionCard key={`behavioral-${index}`} item={item} index={index} />)}</div>
                </section>

                <section className='report-section roadmap-section' id='preparation-roadmap'>
                    <div className='section-heading'><div><span className='section-kicker'>03 / PREPARATION</span><h2>Your preparation roadmap</h2></div><span className='section-count'>{report.preparationPlan.length} days</span></div>
                    <div className='roadmap-list'>
                        {report.preparationPlan.map((day) => (
                            <article className='roadmap-card' key={day.day}>
                                <div className='roadmap-day'><span>DAY</span><strong>{String(day.day).padStart(2, '0')}</strong></div>
                                <div className='roadmap-content'><h3>{day.focus}</h3><ul>{day.tasks.map((task) => <li key={task}>{task}</li>)}</ul></div>
                            </article>
                        ))}
                    </div>
                </section>
                <footer className='report-footer'>Generated for your next step <span>•</span> Keep learning, keep growing</footer>
            </div>

            <aside className='skills-sidebar' aria-labelledby='skill-gaps-heading'>
                <section className={`score-card score-${scoreTone}`} aria-label={`Job match score: ${report.matchScore} percent`}>
                    <div className='score-ring' style={{ '--score': `${report.matchScore}%` }}><div><strong>{report.matchScore}</strong><span>%</span></div></div>
                    <div className='score-copy'><span className='report-eyebrow'>PROFILE MATCH</span><h2>{scoreTitle}</h2><p>{scoreDescription}</p></div>
                    <div className='score-summary'><strong>{report.technicalQuestions.length + report.behavioralQuestions.length}</strong><span>practice questions</span></div>
                </section>
                <div className='skills-heading'><span className='report-eyebrow'>FOCUS AREAS</span><h2 id='skill-gaps-heading'>Skill gaps</h2><p>A few areas to strengthen before your interview.</p></div>
                <div className='skill-list'>
                    {report.skillGaps.map((item) => (
                        <article className='skill-card' key={item.skill}>
                            <span className={`severity-dot severity-${item.severity}`}></span>
                            <div><h3>{item.skill}</h3><span className={`severity-label severity-text-${item.severity}`}>{item.severity} priority</span></div>
                        </article>
                    ))}
                </div>
                <div className='skills-note'><span>TIP</span><p>Use your roadmap to turn each focus area into a small, achievable goal.</p></div>
                
            </aside>
        </main>
    )
}

export default Interview