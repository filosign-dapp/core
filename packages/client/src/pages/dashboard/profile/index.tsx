import { useState, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CaretLeftIcon, CameraIcon, EnvelopeIcon, LockIcon, UserIcon, GearIcon, TrashIcon, CheckIcon, WarningIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/src/lib/components/ui/button"
import { Input } from "@/src/lib/components/ui/input"
import { Textarea } from "@/src/lib/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card"
import { Switch } from "@/src/lib/components/ui/switch"
import { Separator } from "@/src/lib/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/lib/components/ui/form"
import Logo from "@/src/lib/components/custom/Logo"
import { Link } from "@tanstack/react-router"

// Simplified form validation schema
const profileSchema = z.object({
    personal: z.object({
        firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
        lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
        email: z.string().email("Invalid email address"),
        bio: z.string().max(500, "Bio must be less than 500 characters")
    }),
    preferences: z.object({
        emailNotifications: z.boolean(),
        pushNotifications: z.boolean(),
        twoFactorAuth: z.boolean()
    }),
    profilePicture: z.string().nullable(),
    password: z.object({
        current: z.string().min(1, "Current password is required"),
        new: z.string().min(8, "Password must be at least 8 characters"),
        confirm: z.string().min(1, "Please confirm your password")
    }).refine((data) => data.new === data.confirm, {
        message: "Passwords don't match",
        path: ["password", "confirm"]
    })
}).refine((data) => {
    // Only validate password if any field is filled
    const hasPasswordData = data.password.current || data.password.new || data.password.confirm
    return !hasPasswordData || (data.password.current && data.password.new && data.password.confirm)
}, {
    message: "All password fields are required when updating password",
    path: ["password", "current"]
})

type ProfileForm = z.infer<typeof profileSchema>
type SectionKey = 'personal' | 'preferences' | 'profilePicture' | 'password'

interface SectionState {
    isSaving: boolean
    isSaved: boolean
    error?: string
}

// Default values (would come from API in real app)
const DEFAULT_VALUES: ProfileForm = {
    personal: {
        firstName: "Kartikay",
        lastName: "Tiwari",
        email: "kartikay@example.com",
        bio: "Digital signature enthusiast and document workflow optimizer.",
    },
    preferences: {
        emailNotifications: true,
        pushNotifications: false,
        twoFactorAuth: false,
    },
    profilePicture: null,
    password: {
        current: "",
        new: "",
        confirm: "",
    }
}

// Custom hooks for section management
const useSectionState = (sectionKey: SectionKey, form: any, originalValues: ProfileForm) => {
    const [state, setState] = useState<SectionState>({ isSaving: false, isSaved: false })

    const hasChanges = useMemo(() => {
        const currentValues = form.watch()
        const original = originalValues[sectionKey as keyof ProfileForm]

        if (sectionKey === 'password') {
            return Boolean(currentValues.password.current || currentValues.password.new || currentValues.password.confirm)
        }

        if (sectionKey === 'profilePicture') {
            return currentValues.profilePicture !== original
        }

        return JSON.stringify(currentValues[sectionKey as keyof ProfileForm]) !== JSON.stringify(original)
    }, [form.watch(), sectionKey, originalValues])

    // Reset saved state when changes occur
    if (hasChanges && state.isSaved) {
        setState(prev => ({ ...prev, isSaved: false, error: undefined }))
    }

    const save = useCallback(async () => {
        setState({ isSaving: true, isSaved: false, error: undefined })

        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 1000))

            if (sectionKey === 'password') {
                form.setValue("password", { current: "", new: "", confirm: "" })
            }

            setState({ isSaving: false, isSaved: true })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An error occurred"
            setState({ isSaving: false, isSaved: false, error: errorMessage })
        }
    }, [sectionKey, form])

    return { state, hasChanges, save }
}

// Reusable SaveButton component
const SaveButton = ({
    onSave,
    disabled,
    isLoading,
    isSaved,
    error,
    show
}: {
    onSave: () => void
    disabled: boolean
    isLoading: boolean
    isSaved: boolean
    error?: string
    show: boolean
}) => {
    if (!show) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex justify-end gap-2"
        >
            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-destructive text-sm"
                >
                    <WarningIcon className="size-4" />
                    {error}
                </motion.div>
            )}
            <Button
                variant="primary"
                size="sm"
                onClick={onSave}
                disabled={disabled || isLoading}
            >
                {isLoading ? "Saving..." : isSaved ? (
                    <span className="flex gap-2 items-center">
                        <CheckIcon className="size-4" />
                        Saved
                    </span>
                ) : "Save Changes"}
            </Button>
        </motion.div>
    )
}

// File upload handler with error handling
const useFileUpload = (form: any) => {
    const [uploadError, setUploadError] = useState<string>()

    const uploadFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File size must be less than 5MB')
            return
        }

        setUploadError(undefined)

        const reader = new FileReader()
        reader.onload = () => {
            form.setValue("profilePicture", reader.result as string)
        }
        reader.onerror = () => {
            setUploadError('Failed to read file')
        }
        reader.readAsDataURL(file)
    }, [form])

    return { uploadFile, uploadError, clearError: () => setUploadError(undefined) }
}

export default function ProfilePage() {
    const [uploadError, setUploadError] = useState<string>()

    // Setup react-hook-form
    const form = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: DEFAULT_VALUES,
        mode: "onChange"
    })

    // Use custom hooks for section management
    const personalSection = useSectionState('personal', form, DEFAULT_VALUES)
    const preferencesSection = useSectionState('preferences', form, DEFAULT_VALUES)
    const profilePictureSection = useSectionState('profilePicture', form, DEFAULT_VALUES)
    const passwordSection = useSectionState('password', form, DEFAULT_VALUES)

    // File upload handler
    const { uploadFile, clearError } = useFileUpload(form)

    // Create a reusable preference field component
    const PreferenceField = ({
        name,
        label,
        description
    }: {
        name: `preferences.${keyof ProfileForm['preferences']}`
        label: string
        description: string
    }) => (
        <>
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">{label}</FormLabel>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </div>
                )}
            />
            <Separator />
        </>
    )

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="flex sticky top-0 z-50 justify-between items-center px-8 h-16 border-b glass bg-background/50 border-border">
                <div className="flex gap-4 items-center">
                    <Logo className="px-0" textClassName="text-foreground font-bold" iconOnly />
                    <motion.h3
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
                    >
                        Profile Settings
                    </motion.h3>
                </div>
            </header>

            {/* Main Content */}
            <Form {...form}>
                <form>
                    <main className="p-8 mx-auto max-w-4xl space-y-8 flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
                        <Button variant="ghost" size="lg" className="self-start mb-4" asChild>
                            <Link to="/dashboard">
                                <CaretLeftIcon className="size-5" weight="bold" />
                                <p>Back</p>
                            </Link>
                        </Button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
                            className="space-y-8 w-full"
                        >
                            {/* Profile Picture Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex gap-2 items-center">
                                        <UserIcon className="size-5" />
                                        Profile Picture
                                    </CardTitle>
                                    <CardDescription>
                                        Upload a profile picture to personalize your account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="profilePicture"
                                        render={({ field }) => (
                                            <div className="flex gap-6 items-center">
                                                <div className="relative">
                                                    <div className="flex overflow-hidden justify-center items-center w-24 h-24 rounded-full bg-muted/30">
                                                        {field.value ? (
                                                            <img
                                                                src={field.value}
                                                                alt="Profile"
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : (
                                                            <UserIcon className="size-12 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <label className="flex absolute -right-1 -bottom-1 justify-center items-center w-8 h-8 rounded-full transition-colors cursor-pointer bg-foreground hover:bg-foreground/90">
                                                        <CameraIcon className="size-4 text-primary-foreground" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={uploadFile}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <h4 className="font-medium">Upload Profile Picture</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        JPG, PNG or GIF. Max file size 5MB.
                                                    </p>
                                                    {uploadError && (
                                                        <p className="text-sm text-destructive">{uploadError}</p>
                                                    )}
                                                    <div className="flex gap-2">
                                                        {field.value && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => form.setValue("profilePicture", null)}
                                                            >
                                                                <TrashIcon className="size-4 text-destructive" />
                                                            </Button>
                                                        )}
                                                        <SaveButton
                                                            show={profilePictureSection.hasChanges || profilePictureSection.state.isSaved}
                                                            onSave={profilePictureSection.save}
                                                            disabled={profilePictureSection.state.isSaved || profilePictureSection.state.isSaving}
                                                            isLoading={profilePictureSection.state.isSaving}
                                                            isSaved={profilePictureSection.state.isSaved}
                                                            error={profilePictureSection.state.error}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex gap-2 items-center">
                                        <UserIcon className="size-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your personal details and contact information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="personal.firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter your first name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="personal.lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter your last name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="personal.email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <EnvelopeIcon className="absolute top-3 left-3 size-4 text-muted-foreground" />
                                                        <Input
                                                            type="email"
                                                            placeholder="Enter your email"
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="personal.bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us about yourself..."
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <SaveButton
                                        show={personalSection.hasChanges || personalSection.state.isSaved}
                                        onSave={personalSection.save}
                                        disabled={personalSection.state.isSaved || personalSection.state.isSaving}
                                        isLoading={personalSection.state.isSaving}
                                        isSaved={personalSection.state.isSaved}
                                        error={personalSection.state.error}
                                    />
                                </CardContent>
                            </Card>

                            {/* Password Change */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex gap-2 items-center">
                                        <LockIcon className="size-5" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription>
                                        Update your password to keep your account secure
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="password.current"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter current password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="password.new"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>New Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Enter new password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password.confirm"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Confirm new password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <SaveButton
                                        show={passwordSection.hasChanges || passwordSection.state.isSaved}
                                        onSave={passwordSection.save}
                                        disabled={
                                            passwordSection.state.isSaved ||
                                            passwordSection.state.isSaving ||
                                            !form.watch("password.current") ||
                                            !form.watch("password.new") ||
                                            !form.watch("password.confirm")
                                        }
                                        isLoading={passwordSection.state.isSaving}
                                        isSaved={passwordSection.state.isSaved}
                                        error={passwordSection.state.error}
                                    />
                                </CardContent>
                            </Card>

                            {/* Account Preferences */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex gap-2 items-center">
                                        <GearIcon className="size-5" />
                                        Account Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your account settings and preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <PreferenceField
                                        name="preferences.emailNotifications"
                                        label="Email Notifications"
                                        description="Receive email updates about your account activity"
                                    />
                                    <PreferenceField
                                        name="preferences.pushNotifications"
                                        label="Push Notifications"
                                        description="Receive push notifications on your devices"
                                    />
                                    <PreferenceField
                                        name="preferences.twoFactorAuth"
                                        label="Two-Factor Authentication"
                                        description="Add an extra layer of security to your account"
                                    />
                                    <SaveButton
                                        show={preferencesSection.hasChanges || preferencesSection.state.isSaved}
                                        onSave={preferencesSection.save}
                                        disabled={preferencesSection.state.isSaved || preferencesSection.state.isSaving}
                                        isLoading={preferencesSection.state.isSaving}
                                        isSaved={preferencesSection.state.isSaved}
                                        error={preferencesSection.state.error}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </main>
                </form>
            </Form>
        </div>
    )
}
