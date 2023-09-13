const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX;
const AUTH_PREFIX = import.meta.env.VITE_AUTH_PREFIX;

export const loginService = async (username, password) => {
  try {
    const response = await fetch(`${API_V1_PREFIX}${AUTH_PREFIX}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error during login: ${response.status}`);
    }

    const { access_token, token_type } = await response.json();
    return {
      access_token,
      token_type,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const logoutService = async () => {
  console.log('logoutService');
};

export const validateTokenService = async () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) {
      throw new Error('No user information found in local storage');
    }

    const user = JSON.parse(userString);
    const token = user['accessToken'];
    if (!token) {
      throw new Error('No access token found in local storage');
    }

    const response = await fetch(`${API_V1_PREFIX}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Token validation error: ${response.status}`);
    }

    const userResp = await response.json();
    if (!userResp || !userResp['member_id']) {
      throw new Error('Invalid response from authentication server');
    }

    return userResp;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
