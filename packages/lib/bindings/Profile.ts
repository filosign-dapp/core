import z from "zod";
import type { Defaults } from "../types/client";
import type Logger from "./Logger";

const zUserProfile = z.object({
	walletAddress: z.string(),
	email: z.string().nullable(),
	lastActiveAt: z.number(),
	createdAt: z.number(),
	updatedAt: z.number(),
	username: z.string().nullable(),
	displayName: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	bio: z.string().nullable(),
	metadataJson: z.record(z.string(), z.any()).nullable(),
});

const zProfile = z.object({
	walletAddress: z.string(),
	username: z.string(),
	displayName: z.string(),
	avatarUrl: z.string().nullable(),
	bio: z.string().nullable(),
	metadataJson: z.record(z.string(), z.any()).nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

const zProfileExists = z.object({
	exists: z.boolean(),
});

const zUsernameAvailability = z.object({
	available: z.boolean(),
});

export default class Profile {
	private defaults: Defaults;
	private logger: Logger;

	constructor(defaults: Defaults) {
		this.defaults = defaults;
		this.logger = defaults.logger;

		this.logger.info("Profile interface instantiated");
	}

	async checkProfileExists() {
		const { apiClient } = this.defaults;
		apiClient.ensureJwt();

		const response = await apiClient.rpc.getSafe(
			{ data: zProfileExists },
			"/user/profile/exists",
		);
		return response;
	}

	async getProfile() {
		const { apiClient } = this.defaults;
		apiClient.ensureJwt();

		const response = await apiClient.rpc.getSafe(
			{ data: zUserProfile },
			"/user/profile",
		);
		return response;
	}

	async checkUsernameAvailability(username: string) {
		const { apiClient } = this.defaults;
		apiClient.ensureJwt();

		const response = await apiClient.rpc.getSafe(
			{ data: zUsernameAvailability },
			`/user/profile/${username}`,
		);
		return response;
	}

	async createProfile(options: { username: string; displayName: string }) {
		const { apiClient } = this.defaults;
		apiClient.ensureJwt();

		const response = await apiClient.rpc.postSafe(
			{ data: zProfile },
			"/user/profile",
			{
				username: options.username,
				displayName: options.displayName,
			},
		);
		return response;
	}

	async updateProfile(options: {
		username?: string;
		displayName?: string;
		avatarUrl?: string;
		bio?: string;
		metadataJson?: Record<string, any>;
	}) {
		const { apiClient } = this.defaults;
		apiClient.ensureJwt();

		const response = await apiClient.rpc.putSafe(
			{ data: zProfile },
			"/user/profile",
			options,
		);
		return response;
	}
}
