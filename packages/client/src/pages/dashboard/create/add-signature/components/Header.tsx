import {
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
    PrinterIcon,
    ArrowCounterClockwiseIcon,
    ArrowClockwiseIcon,
    FloppyDiskIcon,
    EyeIcon,
    GearIcon,
    PaperPlaneRightIcon
} from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/lib/components/ui/dropdown-menu"
import Logo from "@/src/lib/components/custom/Logo"

interface HeaderProps {
    zoom: number
    onZoomChange: (zoom: number) => void
    onBack: () => void
    onSend: () => void
}

export default function Header({ zoom, onZoomChange, onBack, onSend }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 glass bg-background/95 border-b border-border">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Logo className="px-0" textClassName="text-foreground font-bold" iconOnly />
                        <h3>Add Signature</h3>
                    </div>
                </div>

                {/* Desktop Toolbar */}
                <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowCounterClockwiseIcon className="size-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <ArrowClockwiseIcon className="size-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <FloppyDiskIcon className="size-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onZoomChange(Math.max(zoom - 25, 50))}>
                        <MagnifyingGlassMinusIcon className="size-5" />
                    </Button>
                    <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}%</span>
                    <Button variant="ghost" size="sm" onClick={() => onZoomChange(Math.min(zoom + 25, 200))}>
                        <MagnifyingGlassPlusIcon className="size-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <PrinterIcon className="size-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        PREVIEW
                    </Button>
                    <Button variant="primary" onClick={onSend}>
                        <PaperPlaneRightIcon className="size-4" weight="bold" />
                        Send Envelope
                    </Button>
                </div>

                {/* Mobile Dropdown */}
                <div className="md:hidden flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                <GearIcon className="size-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-lg">
                            <DropdownMenuLabel className="text-muted-foreground text-xs">
                                Navigation
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={onBack} className="gap-2 p-2">
                                <ArrowCounterClockwiseIcon className="size-5" />
                                Back
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuLabel className="text-muted-foreground text-xs">
                                Document
                            </DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2 p-2">
                                <ArrowClockwiseIcon className="size-5" />
                                Redo
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 p-2">
                                <FloppyDiskIcon className="size-5" />
                                Save
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 p-2">
                                <PrinterIcon className="size-5" />
                                Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onSend} className="gap-2 p-2 text-primary font-medium">
                                <PaperPlaneRightIcon className="size-5" />
                                Send
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuLabel className="text-muted-foreground text-xs">
                                View
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onZoomChange(Math.max(zoom - 25, 50))} className="gap-2 p-2">
                                <MagnifyingGlassMinusIcon className="size-5" />
                                Zoom Out
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onZoomChange(Math.min(zoom + 25, 200))} className="gap-2 p-2">
                                <MagnifyingGlassPlusIcon className="size-5" />
                                Zoom In
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 p-2">
                                <EyeIcon className="size-5" />
                                Preview
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="primary" onClick={onSend}>
                        <PaperPlaneRightIcon className="size-4" weight="bold" />
                        Send Envelope
                    </Button>
                </div>
            </div>
        </header>
    )
}
