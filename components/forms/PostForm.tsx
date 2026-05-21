"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "@/lib/api/posts";
import { getPresignedUploadUrl, completeImageUpload } from "@/lib/api/images";
import { useToast } from "@/lib/toast";
import { API_V1_BASE } from "@/lib/env";
import type { PostRequest } from "@/lib/types/post";

const schema = z.object({
  title: z.string().min(1, "제목을 입력하세요.").max(100, "100자 이하로 입력하세요."),
  content: z.string(),
});

export type PostFormValues = z.infer<typeof schema>;

/** content에서 /api/v1/images/{id} 패턴으로 imageId 추출 */
function extractImageIds(content: string): number[] {
  const regex = /\/api\/v1\/images\/(\d+)/g;
  const ids = new Set<number>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.add(Number(match[1]));
  }
  return [...ids];
}

interface PostFormProps {
  onSubmit: (v: PostRequest) => void;
  onCancel: () => void;
  isPending: boolean;
}

interface PostEditFormProps {
  postId: number;
  onSubmit: (v: PostRequest) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function PostForm({ onSubmit, onCancel, isPending }: PostFormProps) {
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<PostFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "" },
  });

  function handleFormSubmit(values: PostFormValues) {
    onSubmit({ ...values, imageIds: extractImageIds(values.content) });
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="mt-4 rounded-xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
    >
      <PostFields register={register} setValue={setValue} getValues={getValues} errors={errors} />
      <FormActions isPending={isPending} isEdit={false} onCancel={onCancel} />
    </form>
  );
}

export function PostEditForm({ postId, onSubmit, onCancel, isPending }: PostEditFormProps) {
  const { data: post, isPending: postPending } = useQuery({
    queryKey: ["posts", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<PostFormValues>({
    resolver: zodResolver(schema),
    values: post ? { title: post.title, content: post.content } : undefined,
  });

  function handleFormSubmit(values: PostFormValues) {
    onSubmit({ ...values, imageIds: extractImageIds(values.content) });
  }

  if (postPending || !post) {
    return (
      <div className="mt-4 rounded-xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient">
        <div className="flex justify-center">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--surface-container-high)] border-t-[var(--primary)]"
            role="status"
            aria-label="로딩 중"
          />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="mt-4 rounded-xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
    >
      <PostFields register={register} setValue={setValue} getValues={getValues} errors={errors} />
      <FormActions isPending={isPending} isEdit={true} onCancel={onCancel} />
    </form>
  );
}

function PostFields({
  register,
  setValue,
  getValues,
  errors,
}: {
  register: ReturnType<typeof useForm<PostFormValues>>["register"];
  setValue: ReturnType<typeof useForm<PostFormValues>>["setValue"];
  getValues: ReturnType<typeof useForm<PostFormValues>>["getValues"];
  errors: ReturnType<typeof useForm<PostFormValues>>["formState"]["errors"];
}) {
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");

  const { ref: registerRef, ...registerRest } = register("content");

  function mergeRef(el: HTMLTextAreaElement | null) {
    textareaRef.current = el;
    registerRef(el);
  }

  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    const start = ta?.selectionStart ?? getValues("content").length;
    const end = ta?.selectionEnd ?? start;
    const current = ta?.value ?? getValues("content");
    setValue("content", current.slice(0, start) + text + current.slice(end), { shouldDirty: true });
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    });
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드할 수 있습니다.", "error");
      return;
    }

    setUploading(true);
    try {
      const resp = await getPresignedUploadUrl({
        contentType: file.type,
        contentLength: file.size,
        fileName: file.name,
      });
      if (!resp?.imageId) throw new Error("presigned URL 발급 실패");

      const s3Res = await fetch(resp.imageUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Content-Length": String(file.size),
        },
        body: file,
      });
      if (!s3Res.ok) throw new Error("S3 업로드 실패");

      await completeImageUpload(resp.imageId);

      insertAtCursor(`![${file.name}](${API_V1_BASE}/images/${resp.imageId})`);
      showToast("이미지가 삽입되었습니다.", "success");
    } catch {
      showToast("이미지 업로드에 실패했습니다.", "error");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    setIsDragOver(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach(uploadFile);
    e.target.value = "";
  }

  function handleInsertUrl() {
    const url = externalUrl.trim();
    if (!url) return;
    insertAtCursor(`![이미지](${url})`);
    setExternalUrl("");
    setPanelOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 제목 */}
      <div>
        <label htmlFor="post-title" className="ui-label">
          제목
        </label>
        <input
          id="post-title"
          {...register("title")}
          aria-describedby={errors.title ? "post-title-error" : undefined}
          className="ui-field"
        />
        {errors.title && (
          <p id="post-title-error" role="alert" className="ui-error">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* 본문 */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="post-content" className="ui-label">
            본문 (마크다운)
          </label>

          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              panelOpen
                ? "bg-[var(--surface-container-low)] text-[var(--primary)]"
                : "text-[var(--on-surface)]/60 hover:bg-[var(--surface-container-low)] rounded-lg"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            이미지 삽입
          </button>
        </div>

        {/* 이미지 삽입 패널 */}
        {panelOpen && (
          <div className="mt-2 space-y-3 rounded-lg bg-[var(--surface-container-low)] p-4">
            {/* 내 컴퓨터에서 선택 */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--on-surface)]/60">내 컴퓨터에서 선택</p>
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--surface-container-lowest)] shadow-ambient px-3 py-2 text-sm font-medium text-[var(--on-surface)]/70 transition-colors ${
                  uploading ? "cursor-not-allowed opacity-50" : "hover:bg-[var(--surface-container-high)]"
                }`}
              >
                {uploading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--surface-container-high)] border-t-[var(--primary)]" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--on-surface)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )}
                {uploading ? "업로드 중..." : "파일 선택"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileInput}
                />
              </label>
            </div>

            <div className="h-px bg-[var(--surface-container-high)]" />

            {/* 외부 URL */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--on-surface)]/60">외부 이미지 URL</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInsertUrl();
                    }
                  }}
                  placeholder="https://example.com/image.png"
                  className="ui-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleInsertUrl}
                  className="rounded-[1.5rem] bg-gradient-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  삽입
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 텍스트 영역 */}
        <div className="relative mt-2">
          <textarea
            id="post-content"
            {...registerRest}
            ref={mergeRef}
            rows={12}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            placeholder="마크다운을 입력하거나 이미지를 드래그하여 놓으세요."
            className={`ui-field ui-textarea font-mono ${
              isDragOver ? "bg-[var(--surface-container-low)]" : ""
            }`}
          />
          {isDragOver && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-[var(--surface-container-low)]/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-container-lowest)] px-4 py-2 shadow-ambient">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm font-medium text-[var(--primary)]">이미지를 놓아 업로드</span>
              </div>
            </div>
          )}
        </div>

        <p className="ui-help">
          이미지를 텍스트 영역에 드래그하거나 &apos;이미지 삽입&apos; 버튼을 사용하세요.
        </p>
      </div>
    </div>
  );
}

function FormActions({
  isPending,
  isEdit,
  onCancel,
}: {
  isPending: boolean;
  isEdit: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-[1.5rem] bg-gradient-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? "처리 중..." : isEdit ? "저장" : "추가"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--surface-container-low)] transition-colors"
      >
        취소
      </button>
    </div>
  );
}
