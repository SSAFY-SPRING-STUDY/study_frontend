"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AssignmentRequest } from "@/lib/types/assignment";

const schema = z.object({
  title: z.string().min(1, "제목을 입력하세요.").max(100, "100자 이하로 입력하세요."),
  content: z.string().min(1, "내용을 입력하세요."),
  prTemplate: z.string().optional(),
  orderInStudy: z.coerce.number().int().min(1, "순서는 1 이상이어야 합니다."),
});

export type AssignmentFormValues = z.infer<typeof schema>;

interface AssignmentFormProps {
  defaultValues?: AssignmentFormValues;
  onSubmit: (v: AssignmentRequest) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function AssignmentForm({ defaultValues, onSubmit, onCancel, isPending }: AssignmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { title: "", content: "", prTemplate: "", orderInStudy: 1 },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 rounded-xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="assignment-title" className="ui-label">
            제목
          </label>
          <input id="assignment-title" {...register("title")} className="ui-field" />
          {errors.title && (
            <p role="alert" className="ui-error">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="assignment-order" className="ui-label">
            순서
          </label>
          <input
            id="assignment-order"
            type="number"
            min={1}
            {...register("orderInStudy")}
            className="ui-field"
          />
          {errors.orderInStudy && (
            <p role="alert" className="ui-error">{errors.orderInStudy.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="assignment-content" className="ui-label">
            내용
          </label>
          <textarea
            id="assignment-content"
            {...register("content")}
            rows={4}
            className="ui-field ui-textarea"
          />
          {errors.content && (
            <p role="alert" className="ui-error">{errors.content.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="assignment-pr-template" className="ui-label">
            PR 템플릿 <span className="text-[var(--on-surface)]/40">(선택)</span>
          </label>
          <textarea
            id="assignment-pr-template"
            {...register("prTemplate")}
            rows={3}
            placeholder="## 구현 내용&#10;..."
            className="ui-field ui-textarea font-mono text-xs"
          />
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
