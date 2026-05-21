"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NoticeRequest } from "@/lib/types/notice";

const schema = z.object({
  title: z.string().min(1, "제목을 입력하세요."),
  content: z.string(),
});

export type NoticeFormValues = z.infer<typeof schema>;

interface NoticeFormProps {
  defaultValues?: NoticeFormValues;
  onSubmit: (v: NoticeRequest) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function NoticeForm({ defaultValues, onSubmit, onCancel, isPending }: NoticeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { title: "", content: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 rounded-xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="notice-title" className="ui-label">
            제목
          </label>
          <input
            id="notice-title"
            {...register("title")}
            aria-describedby={errors.title ? "notice-title-error" : undefined}
            className="ui-field"
          />
          {errors.title && (
            <p id="notice-title-error" role="alert" className="ui-error">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notice-content" className="ui-label">
            본문
          </label>
          <textarea
            id="notice-content"
            {...register("content")}
            rows={6}
            className="ui-field ui-textarea"
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
