import { useFilosignMutation, useFilosignQuery } from "@filosign/react";
import {
	CheckCircleIcon,
	PencilIcon as EditIcon,
	EyeIcon,
	PlusIcon,
	FileSearchIcon as SearchIcon,
	SpinnerIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../../../lib/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../lib/components/ui/card";
import { Input } from "../../../lib/components/ui/input";
import { Label } from "../../../lib/components/ui/label";
import { Textarea } from "../../../lib/components/ui/textarea";

export function ProfileTest() {
	// Profile operations
	const checkProfileExists = useFilosignQuery(
		["profile", "checkProfileExists"],
		undefined,
	);
	const getProfile = useFilosignQuery(["profile", "getProfile"], undefined);
	const checkUsernameAvailability = useFilosignMutation([
		"profile",
		"checkUsernameAvailability",
	]);
	const createProfile = useFilosignMutation(["profile", "createProfile"]);
	const updateProfile = useFilosignMutation(["profile", "updateProfile"]);

	// Input states
	const [usernameToCheck, setUsernameToCheck] = useState("");
	const [newUsername, setNewUsername] = useState("");
	const [newDisplayName, setNewDisplayName] = useState("");
	const [updateUsername, setUpdateUsername] = useState("");
	const [updateDisplayName, setUpdateDisplayName] = useState("");
	const [updateAvatarUrl, setUpdateAvatarUrl] = useState("");
	const [updateBio, setUpdateBio] = useState("");
	const [updateMetadata, setUpdateMetadata] = useState("");

	// Result states
	const [usernameCheckResult, setUsernameCheckResult] = useState<any>(null);

	const handleCheckUsername = async () => {
		if (!usernameToCheck.trim()) return;

		try {
			const result =
				await checkUsernameAvailability.mutateAsync(usernameToCheck);
			setUsernameCheckResult(result);
			console.log("Username check result", result);
		} catch (error) {
			console.error("Failed to check username", error);
		}
	};

	const handleCreateProfile = async () => {
		if (!newUsername.trim() || !newDisplayName.trim()) return;

		try {
			await createProfile.mutateAsync({
				username: newUsername,
				displayName: newDisplayName,
			});
			console.log("Profile created");
			setNewUsername("");
			setNewDisplayName("");
		} catch (error) {
			console.error("Failed to create profile", error);
		}
	};

	const handleUpdateProfile = async () => {
		const updates: any = {};

		if (updateUsername.trim()) updates.username = updateUsername;
		if (updateDisplayName.trim()) updates.displayName = updateDisplayName;
		if (updateAvatarUrl.trim()) updates.avatarUrl = updateAvatarUrl;
		if (updateBio.trim()) updates.bio = updateBio;
		if (updateMetadata.trim()) {
			try {
				updates.metadataJson = JSON.parse(updateMetadata);
			} catch (error) {
				console.error("Invalid JSON in metadata");
				return;
			}
		}

		if (Object.keys(updates).length === 0) return;

		try {
			await updateProfile.mutateAsync(updates);
			console.log("Profile updated");
			setUpdateUsername("");
			setUpdateDisplayName("");
			setUpdateAvatarUrl("");
			setUpdateBio("");
			setUpdateMetadata("");
		} catch (error) {
			console.error("Failed to update profile", error);
		}
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Check Username Availability */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SearchIcon className="w-5 h-5" />
							Check Username Availability
						</CardTitle>
						<CardDescription>
							Check if a username is available for registration
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="username-check">Username</Label>
								<Input
									id="username-check"
									placeholder="Enter username to check..."
									value={usernameToCheck}
									onChange={(e) => setUsernameToCheck(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleCheckUsername}
								disabled={
									!usernameToCheck.trim() || checkUsernameAvailability.isPending
								}
								className="w-full"
								size="lg"
							>
								{checkUsernameAvailability.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<SearchIcon className="w-4 h-4 mr-2" />
								)}
								Check Availability
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Create Profile */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PlusIcon className="w-5 h-5" />
							Create Profile
						</CardTitle>
						<CardDescription>
							Create a new user profile with username and display name
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="new-username">Username</Label>
								<Input
									id="new-username"
									placeholder="Enter username..."
									value={newUsername}
									onChange={(e) => setNewUsername(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="new-display-name">Display Name</Label>
								<Input
									id="new-display-name"
									placeholder="Enter display name..."
									value={newDisplayName}
									onChange={(e) => setNewDisplayName(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleCreateProfile}
								disabled={
									!newUsername.trim() ||
									!newDisplayName.trim() ||
									createProfile.isPending
								}
								className="w-full"
								size="lg"
							>
								{createProfile.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<PlusIcon className="w-4 h-4 mr-2" />
								)}
								Create Profile
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Update Profile */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<EditIcon className="w-5 h-5" />
						Update Profile
					</CardTitle>
					<CardDescription>Update your profile information</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="update-username">Username</Label>
							<Input
								id="update-username"
								placeholder="New username (optional)..."
								value={updateUsername}
								onChange={(e) => setUpdateUsername(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="update-display-name">Display Name</Label>
							<Input
								id="update-display-name"
								placeholder="New display name (optional)..."
								value={updateDisplayName}
								onChange={(e) => setUpdateDisplayName(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="update-avatar-url">Avatar URL</Label>
							<Input
								id="update-avatar-url"
								placeholder="https://..."
								value={updateAvatarUrl}
								onChange={(e) => setUpdateAvatarUrl(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="update-bio">Bio</Label>
							<Input
								id="update-bio"
								placeholder="Tell us about yourself..."
								value={updateBio}
								onChange={(e) => setUpdateBio(e.target.value)}
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="update-metadata">Metadata (JSON)</Label>
						<Textarea
							id="update-metadata"
							placeholder='{"key": "value"}'
							value={updateMetadata}
							onChange={(e) => setUpdateMetadata(e.target.value)}
							rows={3}
						/>
					</div>
					<Button
						onClick={handleUpdateProfile}
						disabled={updateProfile.isPending}
						className="w-full"
						size="lg"
					>
						{updateProfile.isPending ? (
							<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<EditIcon className="w-4 h-4 mr-2" />
						)}
						Update Profile
					</Button>
				</CardContent>
			</Card>

			{/* Profile Information Display */}
			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Profile Exists</CardTitle>
							<Button
								onClick={() => checkProfileExists.refetch()}
								disabled={checkProfileExists.isFetching}
								variant="outline"
								size="sm"
							>
								{checkProfileExists.isFetching ? (
									<SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
								) : (
									<EyeIcon className="w-3 h-3 mr-1" />
								)}
								Check
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg min-h-[60px]">
							{checkProfileExists.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading...
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(checkProfileExists.data || {}, null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">My Profile</CardTitle>
							<Button
								onClick={() => getProfile.refetch()}
								disabled={getProfile.isFetching}
								variant="outline"
								size="sm"
							>
								{getProfile.isFetching ? (
									<SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
								) : (
									<EyeIcon className="w-3 h-3 mr-1" />
								)}
								Refresh
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
							{getProfile.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading...
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(getProfile.data || {}, null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Username Check Result</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg min-h-[60px]">
							{usernameCheckResult ? (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(usernameCheckResult, null, 2)}
								</pre>
							) : (
								<div className="flex items-center gap-2 text-muted-foreground">
									<UserIcon className="w-4 h-4" />
									Enter a username to check availability
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
