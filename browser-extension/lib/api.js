// API service to fetch user profile data from the server

class ApiService {
  constructor() {
    this.baseUrl = null;
  }

  async initialize() {
    try {
      const result = await chrome.storage.local.get(['apiBaseUrl']);
      this.baseUrl = result.apiBaseUrl || 'http://localhost:3000';
      return true;
    } catch (error) {
      console.error('Failed to initialize API service:', error);
      return false;
    }
  }

  async getAuthHeaders() {
    const clerkService = await import('./clerk.js');
    const token = await clerkService.default.getSessionToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async fetchUserProfile() {
    try {
      await this.initialize();
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/users/profile`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  async getUserData() {
    try {
      const profile = await this.fetchUserProfile();
      
      // Format data for form prefilling
      return {
        name: profile.user?.name || '',
        email: profile.user?.email || '',
        firstName: profile.user?.firstName || '',
        lastName: profile.user?.lastName || '',
        gpa: profile.gpaString || profile.gpa?.toString() || '',
        major: profile.major || '',
        extracurriculars: profile.extracurriculars || '',
        achievements: profile.achievements || '',
        personalBackground: profile.personalBackground || '',
        writingSample: profile.writingSample || ''
      };
    } catch (error) {
      console.error('Failed to get user data:', error);
      throw error;
    }
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;

