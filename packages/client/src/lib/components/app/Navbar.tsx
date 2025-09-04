import { LightningIcon } from "@phosphor-icons/react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full z-50 border-b bg-background flex items-center justify-between px-4">
      <div className="flex gap-2 items-center">
        <LightningIcon className="size-8" />
        <h1>Filosign</h1>
      </div>
    </nav>
  )
}