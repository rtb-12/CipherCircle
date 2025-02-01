import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Actor } from "@dfinity/agent";

export class AuthService {
  private static instance: AuthService;
  private authClient: AuthClient | null = null;
  private readonly MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000); // 7 days

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize(): Promise<void> {
    this.authClient = await AuthClient.create({
      idleOptions: {
        disableDefaultIdleCallback: true,
        idleTimeout: 1000 * 60 * 30, // 30 minutes
        onIdle: () => {
          this.logout();
        }
      }
    });
  }

  async login(): Promise<boolean> {
    if (!this.authClient) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.authClient?.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        maxTimeToLive: this.MAX_TIME_TO_LIVE,
        onSuccess: () => resolve(true),
        onError: () => resolve(false)
      });
    });
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
      window.location.reload();
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) {
      await this.initialize();
    }
    return this.authClient?.isAuthenticated() ?? false;
  }

  async getIdentity() {
    if (!this.authClient) {
      await this.initialize();
    }
    return this.authClient?.getIdentity();
  }
}