import decode from 'jwt-decode';

class AuthService {
  // Retrieves Data Saved in a Token

  getProfile() {
    return decode(this.getToken());
  }

  loggedIn() {
    // Verify if the User Is Still Logged In

    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Check if the Token Has Expired or Not

  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  // Retrieve the Token From localStorage

  getToken() {
    return localStorage.getItem('id_token');
  }

  // Set Token to localStorage and Reload Page to Homepage

  login(idToken) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  // Remove the Token From localStorage and Force a Logout With Reload

  logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('saved_books');
    window.location.assign('/');
  }
}
export default new AuthService();
