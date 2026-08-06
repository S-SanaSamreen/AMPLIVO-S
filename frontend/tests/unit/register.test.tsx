import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegisterPage from '@/app/register/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('RegisterPage', () => {
  it('renders register form correctly', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/John/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<RegisterPage />);
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      // It should also show name validation errors, but we check email as a primary marker.
    });
  });
});
