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

const inputCls =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors";

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
      className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="notice-title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            id="notice-title"
            {...register("title")}
            aria-describedby={errors.title ? "notice-title-error" : undefined}
            className={inputCls}
          />
          {errors.title && (
            <p id="notice-title-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notice-content" className="block text-sm font-medium text-gray-700">
            본문
          </label>
          <textarea
            id="notice-content"
            {...register("content")}
            rows={6}
            className={`${inputCls} resize-y`}
          />
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
