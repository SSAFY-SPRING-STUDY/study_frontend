import type { StudyLevel, StudyType } from "@/lib/types/study";

export const LEVEL_LABEL: Record<StudyLevel, string> = {
  BASIC: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

export const TYPE_LABEL: Record<StudyType, string> = {
  BACKEND: "백엔드",
  ALGORITHM: "알고리즘",
  COMPUTER_SCIENCE: "컴퓨터 사이언스",
};

export const STUDY_LEVELS: StudyLevel[] = ["BASIC", "INTERMEDIATE", "ADVANCED"];
export const STUDY_TYPES: StudyType[] = ["BACKEND", "ALGORITHM", "COMPUTER_SCIENCE"];
