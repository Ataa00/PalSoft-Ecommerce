import { apiClient, TokenManager } from '@/lib/api-client';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  UserRole 
} from '@/types/product';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  private static readonly ENDPOINTS = {
    REGISTER: '/Users/register',
    LOGIN: '/Users/login',
    USER_DETAILS: '/Users',
  } as const;

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise<void> - Registration only returns HTTP status
   */
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<void> {
    const registerData: RegisterRequest = {
      id: 0, // Backend will assign the ID
      name: userData.name,
      email: userData.email,
      passwordHash: userData.password, // Backend will hash this
      role: userData.role || UserRole.User,
    };

    await apiClient.post<void>(this.ENDPOINTS.REGISTER, registerData);
  }

  /**
   * Login user and store JWT token
   * @param credentials - User login credentials
   * @returns Promise<LoginResponse> - Contains JWT token
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      this.ENDPOINTS.LOGIN,
      credentials
    );

    // Store the JWT token
    if (response.token) {
      TokenManager.setToken(response.token);
    }

    return response;
  }

  /**
   * Logout user by removing stored token
   */
  static logout(): void {
    TokenManager.removeToken();
  }

  /**
   * Get user details by ID
   * @param userId - User ID
   * @returns Promise<User> - User details
   */
  static async getUserDetails(userId: number): Promise<User> {
    return apiClient.get<User>(`${this.ENDPOINTS.USER_DETAILS}/${userId}`);
  }

  /**
   * Get current user details from token
   * @returns Promise<User | null> - Current user details or null if not authenticated
   */
  static async getCurrentUser(): Promise<User | null> {
    const token = TokenManager.getToken();

    if (!token || TokenManager.isTokenExpired(token)) {
      return null;
    }

    try {
      // Decode JWT to get user ID using Microsoft identity claims
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                     payload.nameid ||
                     payload.sub;

      if (!userId) {
        return null;
      }

      return await this.getUserDetails(parseInt(userId));
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns boolean - True if user has valid token
   */
  static isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  }

  /**
   * Get stored authentication token
   * @returns string | null - JWT token or null
   */
  static getToken(): string | null {
    return TokenManager.getToken();
  }

  /**
   * Refresh authentication status
   * Removes token if expired
   * @returns boolean - True if still authenticated
   */
  static refreshAuthStatus(): boolean {
    const token = TokenManager.getToken();
    
    if (!token) {
      return false;
    }

    if (TokenManager.isTokenExpired(token)) {
      TokenManager.removeToken();
      return false;
    }

    return true;
  }

  /**
   * Get user role from token
   * @returns UserRole | null - User role or null if not authenticated
   */
  static getUserRole(): UserRole | null {
    const token = TokenManager.getToken();

    if (!token || TokenManager.isTokenExpired(token)) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                   payload.role;

      return role === 'Admin' ? UserRole.Admin : UserRole.User;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Check if current user is admin
   * @returns boolean - True if user is admin
   */
  static isAdmin(): boolean {
    return this.getUserRole() === UserRole.Admin;
  }
}

// Export default instance for convenience
export default AuthService;
