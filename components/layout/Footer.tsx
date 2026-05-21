import Link from "next/link";

const ORG_GITHUB_URL = "https://github.com/SSAFY-SPRING-STUDY";

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.18c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.6.23 2.78.11 3.07.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--ui-card-border-strong)]/40">
      <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-[var(--on-surface)]/55">
            <span className="font-medium text-[var(--on-surface)]/70">
              SSAFY Spring Study
            </span>
            <span aria-hidden>·</span>
            <span>© {year} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studies"
              className="text-xs text-[var(--on-surface)]/55 hover:text-[var(--on-surface)] transition-colors"
            >
              스터디
            </Link>
            <span className="text-[var(--on-surface)]/20" aria-hidden>·</span>
            <Link
              href="/notices"
              className="text-xs text-[var(--on-surface)]/55 hover:text-[var(--on-surface)] transition-colors"
            >
              공지사항
            </Link>
            <span className="text-[var(--on-surface)]/20" aria-hidden>·</span>
            <a
              href={ORG_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="SSAFY Spring Study GitHub 조직"
              title="GitHub 조직"
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[var(--on-surface)]/60 hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors"
            >
              <GitHubIcon className="h-4 w-4" />
              <span className="text-xs font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { GitHubIcon };
export { ORG_GITHUB_URL };
