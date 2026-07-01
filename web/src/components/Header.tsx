"use client";

import dynamic from "next/dynamic";

const WalletConnect = dynamic(() => import("./WalletConnect"), { ssr: false });

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 w-full border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--color-1)_96%,transparent)]">
      <div className="mx-auto flex h-full w-full max-w-[var(--content-max)] items-center gap-4 px-4 sm:px-6">
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2.5 text-[var(--text-primary)]"
          aria-label="zkAuction home"
        >
          <span
            className="flex size-6 rotate-45 items-center justify-center rounded-[3px] border border-[var(--verified)] bg-[var(--surface-elevated)]"
            aria-hidden="true"
          >
            <span className="block size-2.5 bg-[var(--verified)]" />
          </span>
          <span className="text-[15px] font-semibold">zkAuction</span>
        </a>

        <nav
          className="ml-4 hidden items-center gap-6 text-sm text-[var(--text-secondary)] md:flex"
          aria-label="Product navigation"
        >
          <a className="transition-colors hover:text-[var(--text-primary)]" href="#protocol">
            Protocol
          </a>
          <a className="transition-colors hover:text-[var(--text-primary)]" href="#demo">
            Demo
          </a>
          <a className="transition-colors hover:text-[var(--text-primary)]" href="#evidence">
            Evidence
          </a>
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span className="size-1.5 bg-[var(--verified)]" aria-hidden="true" />
            <span className="hidden sm:inline">Stellar</span> Testnet
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
