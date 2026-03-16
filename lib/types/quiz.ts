export interface QuizOption {
  optionId: number;
  optionOrder: number;
  content: string;
}

export interface QuizQuestion {
  questionId: number;
  questionOrder: number;
  question: string;
  options: QuizOption[];
}

export interface QuizResponse {
  quizId: number;
  postId: number;
  createdAt: string;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: number;
  selectedOptionId: number;
}

export interface QuizSubmitRequest {
  answers: QuizAnswer[];
}

export interface QuizQuestionResult {
  questionId: number;
  question: string;
  selectedOptionId: number;
  correctOptionId: number;
  correct: boolean;
}

export interface QuizAttemptResponse {
  attemptId: number;
  score: number;
  totalQuestions: number;
  passed: boolean;
  createdAt: string;
  results: QuizQuestionResult[];
}

export interface QuizAttemptSummary {
  attemptId: number;
  memberId: number;
  memberName: string;
  memberNickname: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}
