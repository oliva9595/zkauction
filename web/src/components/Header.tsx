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
            className="flex size-8 shrink-0 rotate-45 items-center justify-center rounded-[5px] border-2 border-[var(--verified)] bg-[color-mix(in_srgb,var(--verified)_16%,var(--color-1))] shadow-[0_0_16px_color-mix(in_srgb,var(--verified)_45%,transparent)]"
            aria-hidden="true"
          >
            <span className="block size-3 rounded-[2px] bg-[var(--verified)]" />
          </span>
          <span className="text-[16px] font-bold leading-none">zkAuction</span>
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
