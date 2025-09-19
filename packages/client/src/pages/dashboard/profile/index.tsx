import { useState, useEffect, useCallback } from "react"
import { CaretLeftIcon, CameraIcon, EnvelopeIcon, LockIcon, UserIcon, GearIcon, TrashIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/src/lib/components/ui/button"
import { Input } from "@/src/lib/components/ui/input"
import { Label } from "@/src/lib/components/ui/label"
import { Textarea } from "@/src/lib/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card"
import { Switch } from "@/src/lib/components/ui/switch"
import { Separator } from "@/src/lib/components/ui/separator"
import Logo from "@/src/lib/components/custom/Logo"
import { Link } from "@tanstack/react-router"

// Types
type SectionKey = 'personal' | 'preferences' | 'profilePicture' | 'password'

type SectionState = {
  hasChanges: boolean
  isSaving: boolean
  isSaved: boolean
}

type FormState = {
  personal: {
    firstName: string
    lastName: string
    email: string
    bio: string
  }
  preferences: {
    emailNotifications: boolean
    pushNotifications: boolean
    twoFactorAuth: boolean
  }
  profilePicture: string | null
  password: {
    current: string
    new: string
    confirm: string
  }
}

// Original values (would come from API in real app)
const ORIGINAL_VALUES: FormState = {
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

// Reusable Components
const SaveButton = ({ onSave, disabled, children, show }: {
  onSave: () => void
  disabled: boolean
  children: React.ReactNode
  show: boolean
}) => (
  show && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end pt-4"
    >
      <Button
        variant="primary"
        size="sm"
        onClick={onSave}
        disabled={disabled}
      >
        {children}
      </Button>
    </motion.div>
  )
)

export default function ProfilePage() {
  // Consolidated form state
  const [form, setForm] = useState<FormState>(ORIGINAL_VALUES)

  // Consolidated section states
  const [sections, setSections] = useState<Record<SectionKey, SectionState>>({
    personal: { hasChanges: false, isSaving: false, isSaved: false },
    preferences: { hasChanges: false, isSaving: false, isSaved: false },
    profilePicture: { hasChanges: false, isSaving: false, isSaved: false },
    password: { hasChanges: false, isSaving: false, isSaved: false }
  })

  // Helper functions
  const updateForm = useCallback((updates: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }, [])

  const updateSection = useCallback((sectionKey: SectionKey, updates: Partial<SectionState>) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], ...updates }
    }))
  }, [])

  // Unified change detection
  useEffect(() => {
    const newSections = { ...sections }

    // Check personal info changes
    newSections.personal.hasChanges = !(
      form.personal.firstName === ORIGINAL_VALUES.personal.firstName &&
      form.personal.lastName === ORIGINAL_VALUES.personal.lastName &&
      form.personal.email === ORIGINAL_VALUES.personal.email &&
      form.personal.bio === ORIGINAL_VALUES.personal.bio
    )

    // Check preferences changes
    newSections.preferences.hasChanges = !(
      form.preferences.emailNotifications === ORIGINAL_VALUES.preferences.emailNotifications &&
      form.preferences.pushNotifications === ORIGINAL_VALUES.preferences.pushNotifications &&
      form.preferences.twoFactorAuth === ORIGINAL_VALUES.preferences.twoFactorAuth
    )

    // Check profile picture changes
    newSections.profilePicture.hasChanges = form.profilePicture !== ORIGINAL_VALUES.profilePicture

    // Check password changes
    newSections.password.hasChanges = form.password.current.length > 0 || form.password.new.length > 0 || form.password.confirm.length > 0

    setSections(newSections)
  }, [form])

  // File upload handler
  const handleProfilePictureUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        updateForm({ profilePicture: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }, [updateForm])

  // Generic save handler
  const handleSave = useCallback(async (sectionKey: SectionKey) => {
    updateSection(sectionKey, { isSaving: true })

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log(`Saving ${sectionKey}:`, form[sectionKey])

      // Reset form to original values or clear password fields
      if (sectionKey === 'password') {
        updateForm({
          password: { current: '', new: '', confirm: '' }
        })
      }

      updateSection(sectionKey, {
        hasChanges: false,
        isSaving: false,
        isSaved: true
      })

      // Reset saved state after 3 seconds
      setTimeout(() => {
        updateSection(sectionKey, { isSaved: false })
      }, 3000)

    } catch (error) {
      console.error(`Error saving ${sectionKey}:`, error)
      updateSection(sectionKey, { isSaving: false })
    }
  }, [form, updateForm, updateSection])

  // Password validation
  const handleChangePassword = useCallback(() => {
    if (form.password.new !== form.password.confirm) {
      alert("New passwords don't match!")
      return
    }
    handleSave('password')
  }, [form.password, handleSave])

  const hasAnyChanges = Object.values(sections).some(section => section.hasChanges)

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
                    className="w-full space-y-8"
                >
                    {/* Profile Picture Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="size-5" />
                                Profile Picture
                            </CardTitle>
                            <CardDescription>
                                Upload a profile picture to personalize your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center overflow-hidden">
                                        {form.profilePicture ? (
                                            <img
                                                src={form.profilePicture}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="size-12 text-muted-foreground" />
                                        )}
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-foreground/90 transition-colors">
                                        <CameraIcon className="size-4 text-primary-foreground" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePictureUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-medium">Upload Profile Picture</h4>
                                    <p className="text-sm text-muted-foreground">
                                        JPG, PNG or GIF. Max file size 5MB.
                                    </p>
                                    <div className="flex gap-2">
                                        {form.profilePicture && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateForm({ profilePicture: null })}
                                            >
                                                <TrashIcon className="size-4 text-destructive" />
                                            </Button>
                                        )}
                                        <AnimatePresence>
                                            <SaveButton
                                                show={sections.profilePicture.hasChanges || sections.profilePicture.isSaved}
                                                onSave={() => handleSave('profilePicture')}
                                                disabled={sections.profilePicture.isSaved || sections.profilePicture.isSaving}
                                            >
                                                {sections.profilePicture.isSaved ? "Saved" : "Save Picture"}
                                            </SaveButton>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="size-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal details and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={form.personal.firstName}
                                        onChange={(e) => updateForm({
                                            personal: { ...form.personal, firstName: e.target.value }
                                        })}
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={form.personal.lastName}
                                        onChange={(e) => updateForm({
                                            personal: { ...form.personal, lastName: e.target.value }
                                        })}
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.personal.email}
                                        onChange={(e) => updateForm({
                                            personal: { ...form.personal, email: e.target.value }
                                        })}
                                        placeholder="Enter your email"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={form.personal.bio}
                                    onChange={(e) => updateForm({
                                        personal: { ...form.personal, bio: e.target.value }
                                    })}
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                />
                            </div>
                            <AnimatePresence>
                                <SaveButton
                                    show={sections.personal.hasChanges || sections.personal.isSaved}
                                    onSave={() => handleSave('personal')}
                                    disabled={sections.personal.isSaved || sections.personal.isSaving}
                                >
                                    {sections.personal.isSaved ? "Saved" : "Save Personal Info"}
                                </SaveButton>
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Password Change */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LockIcon className="size-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={form.password.current}
                                    onChange={(e) => updateForm({
                                        password: { ...form.password, current: e.target.value }
                                    })}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={form.password.new}
                                        onChange={(e) => updateForm({
                                            password: { ...form.password, new: e.target.value }
                                        })}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={form.password.confirm}
                                        onChange={(e) => updateForm({
                                            password: { ...form.password, confirm: e.target.value }
                                        })}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                            <AnimatePresence>
                                <SaveButton
                                    show={sections.password.hasChanges || sections.password.isSaved}
                                    onSave={handleChangePassword}
                                    disabled={
                                        sections.password.isSaved ||
                                        sections.password.isSaving ||
                                        !form.password.current ||
                                        !form.password.new ||
                                        !form.password.confirm
                                    }
                                >
                                    {sections.password.isSaved ? "Saved" : "Change Password"}
                                </SaveButton>
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Account Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GearIcon className="size-5" />
                                Account Preferences
                            </CardTitle>
                            <CardDescription>
                                Manage your account settings and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive email updates about your account activity
                                    </p>
                                </div>
                                <Switch
                                    checked={form.preferences.emailNotifications}
                                    onCheckedChange={(checked) => updateForm({
                                        preferences: { ...form.preferences, emailNotifications: checked }
                                    })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive push notifications on your devices
                                    </p>
                                </div>
                                <Switch
                                    checked={form.preferences.pushNotifications}
                                    onCheckedChange={(checked) => updateForm({
                                        preferences: { ...form.preferences, pushNotifications: checked }
                                    })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Two-Factor Authentication</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Add an extra layer of security to your account
                                    </p>
                                </div>
                                <Switch
                                    checked={form.preferences.twoFactorAuth}
                                    onCheckedChange={(checked) => updateForm({
                                        preferences: { ...form.preferences, twoFactorAuth: checked }
                                    })}
                                />
                            </div>
                            <AnimatePresence>
                                <SaveButton
                                    show={sections.preferences.hasChanges || sections.preferences.isSaved}
                                    onSave={() => handleSave('preferences')}
                                    disabled={sections.preferences.isSaved || sections.preferences.isSaving}
                                >
                                    {sections.preferences.isSaved ? "Saved" : "Save Preferences"}
                                </SaveButton>
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    )
}
