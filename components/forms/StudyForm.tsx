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
  githubOrgName: z.string().max(100).optional(),
  githubRepoName: z.string().max(100).optional(),
  githubWebhookSecret: z.string().max(200).optional(),
});

export type StudyFormValues = z.infer<typeof schema>;

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
      githubOrgName: "",
      githubRepoName: "",
      githubWebhookSecret: "",
    },
  });

  function handleSubmitClean(values: StudyFormValues) {
    onSubmit({
      ...values,
      githubOrgName: values.githubOrgName || undefined,
      githubRepoName: values.githubRepoName || undefined,
      githubWebhookSecret: values.githubWebhookSecret || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitClean)}
      className="mt-4 rounded-xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="study-name" className="ui-label">
            이름
          </label>
          <input
            id="study-name"
            {...register("name")}
            aria-describedby={errors.name ? "study-name-error" : undefined}
            className="ui-field"
          />
          {errors.name && (
            <p id="study-name-error" role="alert" className="ui-error">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="study-description" className="ui-label">
            설명
          </label>
          <textarea
            id="study-description"
            {...register("description")}
            rows={2}
            className="ui-field ui-textarea"
          />
          {errors.description && (
            <p role="alert" className="ui-error">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="study-level" className="ui-label">
            레벨
          </label>
          <select id="study-level" {...register("level")} className="ui-field">
            {STUDY_LEVELS.map((l: StudyLevel) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="study-type" className="ui-label">
            타입
          </label>
          <select id="study-type" {...register("type")} className="ui-field">
            {STUDY_TYPES.map((t: StudyType) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <p className="text-label text-[var(--on-surface)]/60 mb-3">GitHub 연동 (선택)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="study-github-org" className="ui-label">
                Org 이름
              </label>
              <input
                id="study-github-org"
                {...register("githubOrgName")}
                placeholder="예: my-org"
                className="ui-field"
              />
            </div>
            <div>
              <label htmlFor="study-github-repo" className="ui-label">
                Repo 이름
              </label>
              <input
                id="study-github-repo"
                {...register("githubRepoName")}
                placeholder="예: study-assignments"
                className="ui-field"
              />
            </div>
            <div>
              <label htmlFor="study-github-secret" className="ui-label">
                Webhook Secret
              </label>
              <input
                id="study-github-secret"
                {...register("githubWebhookSecret")}
                type="password"
                placeholder="Webhook secret"
                className="ui-field"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-[1.5rem] bg-gradient-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "처리 중..." : defaultValues ? "저장" : "추가"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--surface-container-low)] transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
