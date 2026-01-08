"use client"

import { SubmitLessonQuiz } from "@/actions/db"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LessonQuizQuestion } from "@/hooks/query-options"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

export default function LessonQuiz({quiz}: {quiz: LessonQuizQuestion[]}) {

    const params = useParams<{ id: string }>()

    const [currentStage, setCurrentStage] = useState<number>(-1) // -1 = answering, 0 = failed, 1 = passed
    const [questionIndex, setQuestionIndex] = useState<number>(0)
    const [userAnswers, setUserAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({})

    const currentQuestion = quiz[questionIndex]
    const selectedAnswer = userAnswers[currentQuestion.id]

    const answeredCount = Object.keys(userAnswers).length
    const totalQuestions = quiz.length
    const progressValue = (answeredCount / totalQuestions) * 100
    const canSubmit = answeredCount === totalQuestions && currentStage === -1

    const onQuestionToggle = (increment: number) => {
        if (increment > 0 && questionIndex >= quiz.length - 1) return
        if (increment < 0 && questionIndex <= 0) return
        setQuestionIndex(prev => prev + increment)
    }

    const handleAnswerSelect = (answer: "A" | "B" | "C" | "D") => {
        if (currentStage != -1) return
        setUserAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: answer,
        }))
    }

    const handleStartLesson = async () => {
        const { passed } = await SubmitLessonQuiz({ lessonId: Number(params.id), answers: userAnswers })
        setCurrentStage(passed ? 1 : 0)
        setQuestionIndex(0)
    }

    const handleRestartLesson = () => {
        setCurrentStage(-1)
        setQuestionIndex(0)
        setUserAnswers({})
    }

    const getOptionClass = (option: "A" | "B" | "C" | "D") => {
        const isSelected = selectedAnswer === option
        const isCorrect = option === currentQuestion.correct_answer
        const userWasWrong = selectedAnswer !== currentQuestion.correct_answer

        if (currentStage === -1) {
            if (isSelected) {
                return "border-blue-500 bg-blue-50 dark:bg-blue-500"
            }
            return "border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-400"
        } else {
            if (isSelected && !isCorrect && userWasWrong) {
                return "border-red-500 bg-red-50 dark:bg-red-500"
            }
            if (isCorrect && userWasWrong) {
                return "border-blue-500 bg-blue-50 dark:bg-blue-500"
            }
            if (isSelected && isCorrect) {
                return "border-green-500 bg-green-50 dark:bg-green-500"
            }
            return "border-gray-300"
        }
    }

    return (
        <div className="min-h-screen bg-muted p-6 md:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-blue-500">Lesson {params.id} Quiz</h1>
                    {currentStage != -1 ? <h2 className="text-xl font-normal">{currentStage === 0 ? "You didn't pass, try again!" : "Congratulations, you passed!"}</h2> : null}
                </div>

                <div className="mb-12 flex items-center justify-center gap-4">
                    <Progress value={progressValue} className={`w-full max-w-2xl ${currentStage === -1 ? "[&>div]:bg-blue-500" : currentStage === 0 ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"}`} />
                    {canSubmit ? <Button size="lg" className="cursor-pointer bg-blue-500 text-white text-xl hover:bg-blue-600" onClick={handleStartLesson}>Submit</Button> : null}
                    {currentStage === 1 ? (
                        <Link href="/roadmap">
                            <div className="shadow-md rounded-full py-2 px-5 text-x text-white bg-green-500 hover:bg-green-600 transition-colors">
                                <span>Go To Roadmap</span>
                            </div>
                        </Link>
                    ) : null}
                    {currentStage === 0 ? <Button size="lg" className="cursor-pointer bg-red-500 text-white text-xl hover:bg-red-600" onClick={handleRestartLesson}>Retry Quiz</Button> : null}
                </div>

                <div className="mb-6 flex items-start gap-4">
                    <span className="text-4xl font-bold text-blue-500">{currentQuestion.question_order}</span>
                    <p className="pt-2 text-lg text-foreground">{currentQuestion.question_text}</p>
                </div>

                <div className="mb-12 space-y-3">
                    {(["A", "B", "C", "D"] as const).map((option) => {
                        const optionKey = `option_${option.toLowerCase()}` as keyof LessonQuizQuestion
                        const optionText = currentQuestion[optionKey] as string

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswerSelect(option)}
                                className={`cursor-pointer flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${getOptionClass(option)}`}
                                aria-label={`Option ${option}`}
                            >
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current">
                                    {selectedAnswer === option && <div className="h-3 w-3 rounded-full bg-current"></div>}
                                </div>
                                <span className="font-light text-base text-foreground">{optionText}</span>
                            </button>
                        )
                    })}
                </div>

                {currentStage != -1 && selectedAnswer !== currentQuestion.correct_answer && (
                    <div className="mb-12 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-500 p-4">
                        <p className="font-bold text-blue-500 dark:text-white">Explanation:</p>
                        <p className="font-light text-foreground">{currentQuestion.explanation}</p>
                    </div>
                )}

                <div className="flex items-center justify-center gap-8">

                    <Button
                        onClick={() => {onQuestionToggle(-1)}}
                        disabled={questionIndex === 0}
                        variant="outline"
                        size="icon"
                        className="cursor-pointer h-12 w-12 rounded-full shadow-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-blue-500"
                        aria-label="Previous question"
                    >
                        <FiChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                        onClick={() => {onQuestionToggle(1)}}
                        disabled={questionIndex === quiz.length - 1}
                        variant="outline"
                        size="icon"
                        className="cursor-pointer h-12 w-12 rounded-full shadow-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-blue-500"
                        aria-label="Next question"
                    >
                        <FiChevronRight className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    )
}