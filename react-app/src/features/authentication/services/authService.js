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
