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
      className="mt-4 ui-card-static bg-[var(--surface-container-low)] p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="curriculum-name" className="ui-label">
            이름
          </label>
          <input
            id="curriculum-name"
            {...register("name")}
            aria-describedby={errors.name ? "curriculum-name-error" : undefined}
            className="ui-field"
          />
          {errors.name && (
            <p id="curriculum-name-error" role="alert" className="ui-error">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="curriculum-description"
            className="ui-label"
          >
            설명
          </label>
          <textarea
            id="curriculum-description"
            {...register("description")}
            rows={2}
            className="ui-field ui-textarea"
          />
        </div>

        <div>
          <label htmlFor="curriculum-order" className="ui-label">
            순서
          </label>
          <input
            id="curriculum-order"
            type="number"
            {...register("order")}
            aria-describedby={errors.order ? "curriculum-order-error" : undefined}
            className="ui-field"
          />
          {errors.order && (
            <p id="curriculum-order-error" role="alert" className="ui-error">
              {errors.order.message}
            </p>
          )}
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
