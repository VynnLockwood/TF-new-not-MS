import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../../app/login/page'; // Adjust the import path as needed
import { useRouter } from 'next/navigation';
import React from 'react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginPage', () => {
  let pushMock;

  beforeEach(() => {
    pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });

    // Mock fetch to simulate an unauthenticated user by default (e.g., 401)
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      })
    );

    // Mock window.open
    global.window.open = jest.fn();

    // Suppress console.error by default, but allow spying in specific tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); // Restore console.error
  });

  it('renders login page with welcome message and Google login button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByText('Log in with Google')).toBeInTheDocument();
    expect(screen.getByAltText('Google Logo')).toBeInTheDocument();
  });

  it('checks authentication on mount and redirects if valid', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: true }),
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/check`,
        { method: 'GET', credentials: 'include' }
      );
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles auth check error without crashing when user is not logged in', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(); // Override suppression for this test

    // Use the default 401 mock from beforeEach
    render(<LoginPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error during auth check:',
        expect.objectContaining({ message: expect.any(String) })
      );
      expect(screen.getByText('Log in with Google')).toBeInTheDocument(); // Page still renders
      expect(pushMock).not.toHaveBeenCalled(); // No redirect since not authenticated
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles Google login button click', async () => {
    render(<LoginPage />);

    const loginButton = screen.getByText('Log in with Google');
    fireEvent.click(loginButton);

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
    expect(window.open).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/login`
    );
  });

  it('displays error message when login fails', async () => {
    const originalWindowOpen = window.open;
    window.open = jest.fn(() => {
      throw new Error('Login failed');
    });

    render(<LoginPage />);

    const loginButton = screen.getByText('Log in with Google');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred while trying to log in.')).toBeInTheDocument();
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
      expect(loginButton).not.toBeDisabled();
    });

    window.open = originalWindowOpen;
  });

  it('shows loading state while logging in', () => {
    render(<LoginPage />);
    
    const loginButton = screen.getByText('Log in with Google');
    fireEvent.click(loginButton);
    
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(loginButton).toHaveClass('cursor-not-allowed opacity-50');
    expect(loginButton).toBeDisabled();
  });

  it('renders logo image correctly', () => {
    render(<LoginPage />);
    
    const logo = screen.getByAltText('Thai Foods Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute(
      'src',
      'https://i.postimg.cc/sX2ntz2w/Wok-Asian-Food-Logo.png'
    );
  });
});