"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { STUDY_LEVELS, STUDY_TYPES, LEVEL_LABEL, TYPE_LABEL } from "@/lib/constants";
import type { StudyRequest, StudyLevel, StudyType } from "@/lib/types/study";

const schema = z.object({
  name: z.string().min(1, "이름을 입력하세요.").max(100, "100자 이하로 입력하세요."),
  description: z.string().max(500, "500자 이하로 입력하세요."),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
  type: z.enum(["BACKEND", "ALGORITHM", "COMPUTER_SCIENCE"]),
});

export type StudyFormValues = z.infer<typeof schema>;

const inputCls =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors";

interface StudyFormProps {
  defaultValues?: StudyFormValues;
  onSubmit: (v: StudyRequest) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function StudyForm({ defaultValues, onSubmit, onCancel, isPending }: StudyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      level: "BASIC",
      type: "BACKEND",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="study-name" className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            id="study-name"
            {...register("name")}
            aria-describedby={errors.name ? "study-name-error" : undefined}
            className={inputCls}
          />
          {errors.name && (
            <p id="study-name-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="study-description" className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            id="study-description"
            {...register("description")}
            rows={2}
            className={`${inputCls} resize-y`}
          />
          {errors.description && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="study-level" className="block text-sm font-medium text-gray-700">
            레벨
          </label>
          <select id="study-level" {...register("level")} className={inputCls}>
            {STUDY_LEVELS.map((l: StudyLevel) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="study-type" className="block text-sm font-medium text-gray-700">
            타입
          </label>
          <select id="study-type" {...register("type")} className={inputCls}>
            {STUDY_TYPES.map((t: StudyType) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "처리 중..." : defaultValues ? "저장" : "추가"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
