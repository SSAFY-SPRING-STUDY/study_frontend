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
        className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]"
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
        <h1 className="text-headline-md text-[var(--on-surface)]">퀴즈</h1>
        <Link
          href={backUrl}
          className="text-sm font-medium text-[var(--on-surface)]/60 hover:text-[var(--on-surface)] transition-colors"
        >
          ← 게시글로 돌아가기
        </Link>
      </div>

      <div className="space-y-6">
        {shuffledQuestions.map((q: QuizQuestion, idx: number) => (
          <div
            key={q.questionId}
            className="rounded-xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
          >
            <p className="mb-4 text-base font-semibold text-[var(--on-surface)]">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
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
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      selected
                        ? "bg-[var(--surface-container-low)] text-[var(--primary)]"
                        : "bg-[var(--surface-container-low)]/50 text-[var(--on-surface)]/70 hover:bg-[var(--surface-container-low)]"
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
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--surface-container-high)] text-[var(--on-surface)]/40"
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
        <p className="text-sm text-[var(--on-surface)]/50">
          {Object.keys(answers).length} / {shuffledQuestions.length} 답변 완료
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="inline-flex items-center rounded-[1.5rem] bg-gradient-primary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
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
        <h1 className="text-headline-md text-[var(--on-surface)]">퀴즈 결과</h1>
        <Link
          href={backUrl}
          className="text-sm font-medium text-[var(--on-surface)]/60 hover:text-[var(--on-surface)] transition-colors"
        >
          ← 게시글로 돌아가기
        </Link>
      </div>

      {/* Score Card */}
      <div className="mb-6 rounded-xl bg-[var(--surface-container-lowest)] p-8 shadow-ambient text-center">
        <div
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
            attempt.passed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {attempt.passed ? "합격" : "불합격"}
        </div>
        <p className="mt-4 text-5xl font-bold text-[var(--on-surface)]">
          {attempt.score}
          <span className="text-2xl text-[var(--on-surface)]/40"> / {attempt.totalQuestions}</span>
        </p>
        <p className="mt-2 text-lg text-[var(--on-surface)]/60">{passRate}% 정답</p>
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
                className={`rounded-xl p-5 ${
                  r.correct
                    ? "bg-emerald-50"
                    : "bg-red-50"
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
                    <p className="text-sm font-semibold text-[var(--on-surface)]">{r.question}</p>
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
          className="inline-flex items-center rounded-[1.5rem] bg-gradient-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          다시 도전
        </button>
        <Link
          href={backUrl}
          className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--surface-container-low)] transition-colors"
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
        <Link href={backUrl} className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
          ← 게시글로 돌아가기
        </Link>
      </div>
    );
  }

  if (status.state === "no-quiz") {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <div className="rounded-xl bg-[var(--surface-container-lowest)] p-8 shadow-ambient">
          <h2 className="text-headline-md text-[var(--on-surface)]">퀴즈가 없습니다</h2>
          <p className="mt-2 text-sm text-[var(--on-surface)]/60">이 게시글에 대한 퀴즈가 아직 생성되지 않았습니다.</p>
          {isAdmin && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-6 inline-flex items-center rounded-[1.5rem] bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isGenerating ? "생성 중..." : "AI 퀴즈 생성"}
            </button>
          )}
          <div className="mt-4">
            <Link
              href={backUrl}
              className="text-sm font-medium text-[var(--on-surface)]/60 hover:text-[var(--on-surface)] transition-colors"
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
