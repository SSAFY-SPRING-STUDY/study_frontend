"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useIsAdmin } from "@/store/auth-store";
import { getMyQuizAttempt, getQuiz, submitQuiz, generateQuiz } from "@/lib/api/quiz";
import { useToast } from "@/lib/toast";
import type { QuizResponse, QuizAttemptResponse, QuizAnswer, QuizQuestion } from "@/lib/types/quiz";

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

type PageStatus =
  | { state: "loading" }
  | { state: "quiz"; quiz: QuizResponse }
  | { state: "result"; attempt: QuizAttemptResponse; quiz: QuizResponse | null }
  | { state: "no-quiz" }
  | { state: "error"; message: string };

function LoadingSpinner() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"
        role="status"
        aria-label="로딩 중"
      />
    </div>
  );
}

function QuizScreen({
  quiz,
  backUrl,
  onSubmit,
  isSubmitting,
}: {
  quiz: QuizResponse;
  backUrl: string;
  onSubmit: (answers: QuizAnswer[]) => void;
  isSubmitting: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // 마운트 시 한 번만 문제 순서 + 각 선택지 순서 셔플
  const shuffledQuestions = useMemo(
    () =>
      shuffle(quiz.questions).map((q) => ({
        ...q,
        options: shuffle(q.options),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quiz.quizId]
  );

  const allAnswered = shuffledQuestions.every((q) => answers[q.questionId] !== undefined);

  function handleSelect(questionId: number, optionId: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleSubmit() {
    const answerList: QuizAnswer[] = Object.entries(answers).map(([qId, optId]) => ({
      questionId: Number(qId),
      selectedOptionId: optId,
    }));
    onSubmit(answerList);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">퀴즈</h1>
        <Link
          href={backUrl}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 게시글로 돌아가기
        </Link>
      </div>

      <div className="space-y-6">
        {shuffledQuestions.map((q: QuizQuestion, idx: number) => (
          <div
            key={q.questionId}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="mb-4 text-base font-semibold text-gray-900">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {idx + 1}
              </span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const selected = answers[q.questionId] === opt.optionId;
                return (
                  <label
                    key={opt.optionId}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.questionId}`}
                      value={opt.optionId}
                      checked={selected}
                      onChange={() => handleSelect(q.questionId, opt.optionId)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        selected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {optIdx + 1}
                    </span>
                    <span className="text-sm">{opt.content}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {Object.keys(answers).length} / {shuffledQuestions.length} 답변 완료
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "제출 중..." : "제출"}
        </button>
      </div>
    </div>
  );
}

function ResultScreen({
  attempt,
  quiz,
  backUrl,
  onRetry,
}: {
  attempt: QuizAttemptResponse;
  quiz: QuizResponse | null;
  backUrl: string;
  onRetry: () => void;
}) {
  const passRate = Math.round((attempt.score / attempt.totalQuestions) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">퀴즈 결과</h1>
        <Link
          href={backUrl}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 게시글로 돌아가기
        </Link>
      </div>

      {/* Score Card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <div
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
            attempt.passed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {attempt.passed ? "합격" : "불합격"}
        </div>
        <p className="mt-4 text-5xl font-bold text-gray-900">
          {attempt.score}
          <span className="text-2xl text-gray-400"> / {attempt.totalQuestions}</span>
        </p>
        <p className="mt-2 text-lg text-gray-600">{passRate}% 정답</p>
      </div>

      {/* Per-question results */}
      {attempt.results && attempt.results.length > 0 && (
        <div className="space-y-3">
          {attempt.results.map((r, idx) => {
            const questionData = quiz?.questions.find((q) => q.questionId === r.questionId);
            const selectedOption = questionData?.options.find(
              (o) => o.optionId === r.selectedOptionId
            );
            const correctOption = questionData?.options.find(
              (o) => o.optionId === r.correctOptionId
            );

            return (
              <div
                key={r.questionId}
                className={`rounded-xl border p-5 ${
                  r.correct
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      r.correct
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{r.question}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      {!r.correct && (
                        <p className="text-red-700">
                          내 답: {selectedOption?.content ?? `선택지 ${r.selectedOptionId}`}
                        </p>
                      )}
                      <p className={r.correct ? "text-emerald-700 font-medium" : "text-emerald-700"}>
                        정답: {correctOption?.content ?? `선택지 ${r.correctOptionId}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xl ${r.correct ? "text-emerald-600" : "text-red-500"}`}>
                    {r.correct ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          다시 도전
        </button>
        <Link
          href={backUrl}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          게시글로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function QuizPage({
  params,
}: {
  params: Promise<{ studyId: string; curriculumId: string; postId: string }>;
}) {
  const { studyId, curriculumId, postId } = use(params);
  const sId = studyId;
  const cId = curriculumId;
  const id = Number(postId);
  const isAdmin = useIsAdmin();
  const { showToast } = useToast();

  const backUrl = `/studies/${sId}/curriculums/${cId}/posts/${postId}`;

  const [status, setStatus] = useState<PageStatus>({ state: "loading" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setStatus({ state: "error", message: "잘못된 게시글 ID입니다." });
      return;
    }

    async function init() {
      try {
        const attempt = await getMyQuizAttempt(id);
        if (attempt) {
          // Attempt exists — fetch quiz for option labels then show result
          let quiz: QuizResponse | null = null;
          try {
            quiz = await getQuiz(id);
          } catch {
            // ignore — quiz labels won't show
          }
          setStatus({ state: "result", attempt, quiz });
          return;
        }
        // No attempt — fetch quiz
        let quiz: QuizResponse | null = null;
        try {
          quiz = await getQuiz(id);
        } catch (e: unknown) {
          const axiosErr = e as { response?: { status?: number } };
          if (axiosErr?.response?.status === 404) {
            setStatus({ state: "no-quiz" });
            return;
          }
          throw e;
        }
        if (!quiz) {
          setStatus({ state: "no-quiz" });
          return;
        }
        setStatus({ state: "quiz", quiz });
      } catch {
        setStatus({ state: "error", message: "퀴즈를 불러오지 못했습니다." });
      }
    }

    init();
  }, [id]);

  async function handleSubmit(answers: QuizAnswer[]) {
    setIsSubmitting(true);
    try {
      const attempt = await submitQuiz(id, { answers });
      if (!attempt) throw new Error("no result");
      const currentQuiz = status.state === "quiz" ? status.quiz : null;
      setStatus({ state: "result", attempt, quiz: currentQuiz });
      showToast("퀴즈를 제출했습니다.", "success");
    } catch {
      showToast("퀴즈 제출에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRetry() {
    setStatus({ state: "loading" });
    try {
      const quiz = await getQuiz(id);
      if (!quiz) {
        setStatus({ state: "no-quiz" });
        return;
      }
      setStatus({ state: "quiz", quiz });
    } catch {
      setStatus({ state: "error", message: "퀴즈를 불러오지 못했습니다." });
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      await generateQuiz(id);
      showToast("퀴즈 생성을 요청했습니다. 잠시 후 다시 시도해주세요.", "success");
      // Refresh
      const quiz = await getQuiz(id);
      if (quiz) {
        setStatus({ state: "quiz", quiz });
      }
    } catch {
      showToast("퀴즈 생성에 실패했습니다.", "error");
    } finally {
      setIsGenerating(false);
    }
  }

  if (status.state === "loading") {
    return <LoadingSpinner />;
  }

  if (status.state === "error") {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-red-600">{status.message}</p>
        <Link href={backUrl} className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          ← 게시글로 돌아가기
        </Link>
      </div>
    );
  }

  if (status.state === "no-quiz") {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-2xl mb-2">📝</p>
          <h2 className="text-xl font-semibold text-gray-900">퀴즈가 없습니다</h2>
          <p className="mt-2 text-sm text-gray-600">이 게시글에 대한 퀴즈가 아직 생성되지 않았습니다.</p>
          {isAdmin && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-6 inline-flex items-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isGenerating ? "생성 중..." : "AI 퀴즈 생성"}
            </button>
          )}
          <div className="mt-4">
            <Link
              href={backUrl}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← 게시글로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status.state === "result") {
    return (
      <ResultScreen
        attempt={status.attempt}
        quiz={status.quiz}
        backUrl={backUrl}
        onRetry={handleRetry}
      />
    );
  }

  // state === "quiz"
  return (
    <QuizScreen
      quiz={status.quiz}
      backUrl={backUrl}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
