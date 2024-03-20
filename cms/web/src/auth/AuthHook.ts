export default interface AuthHook {
  user: any; // Replace 'any' with your user type
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  getAccessToken: () => Promise<string>;
  login: () => void;
  logout: () => void;
}
