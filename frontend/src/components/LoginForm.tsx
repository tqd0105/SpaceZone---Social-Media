const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
      credentials: 'include', // Add this to handle cookies
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      onLoginSuccess();
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.name === 'AbortError') {
      setError('Request timed out. Please try again.');
    } else {
      setError(error.message || 'An error occurred during login');
    }
  } finally {
    setIsLoading(false);
  }
}; 