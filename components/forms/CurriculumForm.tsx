"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CurriculumRequest } from "@/lib/types/curriculum";

const schema = z.object({
  name: z.string().min(1, "이름을 입력하세요."),
  description: z.string(),
  order: z.coerce.number().int().min(0, "0 이상의 숫자를 입력하세요."),
});

export type CurriculumFormValues = z.infer<typeof schema>;

const inputCls =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors";

interface CurriculumFormProps {
  defaultValues?: CurriculumFormValues;
  onSubmit: (v: CurriculumRequest) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function CurriculumForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: CurriculumFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CurriculumFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { name: "", description: "", order: 0 },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="curriculum-name" className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            id="curriculum-name"
            {...register("name")}
            aria-describedby={errors.name ? "curriculum-name-error" : undefined}
            className={inputCls}
          />
          {errors.name && (
            <p id="curriculum-name-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="curriculum-description"
            className="block text-sm font-medium text-gray-700"
          >
            설명
          </label>
          <textarea
            id="curriculum-description"
            {...register("description")}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="curriculum-order" className="block text-sm font-medium text-gray-700">
            순서
          </label>
          <input
            id="curriculum-order"
            type="number"
            {...register("order")}
            aria-describedby={errors.order ? "curriculum-order-error" : undefined}
            className={inputCls}
          />
          {errors.order && (
            <p id="curriculum-order-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.order.message}
            </p>
          )}
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
