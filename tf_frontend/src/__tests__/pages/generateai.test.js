import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeneratePage from '../../app/generateai/page'; // Adjust the import path as needed
import { useRouter } from 'next/navigation';
import React from 'react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Generic mock data for different scenarios
const mockData = {
  success: {
    generate: { response: 'Mock recipe text', is_safe: true },
    parse: {
      menuName: 'Mock Recipe',
      ingredients: ['item1', 'item2'],
      instructions: ['step1', 'step2'],
      category: 'Mock Category',
      tags: ['tag1', 'tag2'],
      characteristics: 'Mock Char',
      flavors: 'Mock Flavor',
      danger_check: { status: 'safe' },
    },
    youtube: { videos: [{ id: 'vid1' }, { id: 'vid2' }] },
  },
  unsafeGenerate: {
    generate: { response: 'Mock unsafe text', is_safe: false, reason: 'Unsafe reason', fix: 'Fix it' },
  },
  unsafeParse: {
    generate: { response: 'Mock recipe text', is_safe: true },
    parse: {
      menuName: 'Mock Unsafe Recipe',
      ingredients: ['item1'],
      instructions: ['step1'],
      category: 'Mock Category',
      tags: ['tag1'],
      characteristics: 'Mock Char',
      flavors: 'Mock Flavor',
      danger_check: { status: 'not safe', reason: 'Parse unsafe', fix: 'Parse fix' },
    },
  },
  unauthorized: {
    generate: { status: 401 }, // Simulating a 401 response
  },
  error: {
    generate: new Error('Mock fetch error'),
  },
};

describe('GeneratePage', () => {
  let pushMock;

  beforeEach(() => {
    pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });

    // Mock fetch globally
    global.fetch = jest.fn();

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock console methods to suppress logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the generate page with initial UI elements', () => {
    render(<GeneratePage />);
    expect(screen.getByText('ค้นหาสูตรอาหารที่คุณต้องการไม่เจอใช่ไหม?')).toBeInTheDocument();
    expect(screen.getByText('ลองสร้างสูตรอาหารที่ตรงตามคุณต้องการเองเลยสิ!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate & Search/i })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('updates prompt input value', () => {
    render(<GeneratePage />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Mock prompt' } });
    expect(input).toHaveValue('Mock prompt');
  });

  it('enables generate button when prompt is provided', () => {
    render(<GeneratePage />);
    const button = screen.getByRole('button', { name: /Generate & Search/i });
    expect(button).toBeDisabled();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Mock prompt' } });
    expect(button).not.toBeDisabled();
  });

  it('handles successful recipe generation and navigation', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData.success.generate) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData.success.parse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData.success.youtube) });

    render(<GeneratePage />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Mock prompt' } });
    const button = screen.getByRole('button', { name: /Generate & Search/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument(); // Loading state
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('generatedMenuName', 'Mock Recipe');
      expect(pushMock).toHaveBeenCalledWith('/food_generated?menuName=Mock%20Recipe');
    }, { timeout: 2000 });
  });

  it('detects and displays error when recipe is not safe from generate API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData.unsafeGenerate.generate),
    });

    render(<GeneratePage />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Unsafe prompt' } });
    const button = screen.getByRole('button', { name: /Generate & Search/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/สูตรอาหารนี้ไม่ปลอดภัย/)).toBeInTheDocument();
      expect(screen.getByText(/เหตุผล: Unsafe reason/)).toBeInTheDocument();
      expect(screen.getByText(/วิธีแก้ไข: Fix it/)).toBeInTheDocument();
    });
  });

  it('detects and displays error when recipe is not safe from parse API', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData.unsafeParse.generate) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData.unsafeParse.parse) });

    render(<GeneratePage />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Unsafe parse prompt' } });
    const button = screen.getByRole('button', { name: /Generate & Search/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/สูตรอาหารนี้ไม่ปลอดภัย/)).toBeInTheDocument();
      expect(screen.getByText(/เหตุผล: Parse unsafe/)).toBeInTheDocument();
      expect(screen.getByText(/วิธีแก้ไข: Parse fix/)).toBeInTheDocument();
    });
  });

  it('detects unauthorized access and shows login dialog', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve(mockData.unauthorized.generate),
    });

    render(<GeneratePage />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Unauthorized prompt' } });
    const button = screen.getByRole('button', { name: /Generate & Search/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('ต้องเข้าสู่ระบบ')).toBeInTheDocument();
      const loginButton = screen.getByRole('button', { name: 'เข้าสู่ระบบ' });
      fireEvent.click(loginButton);
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('detects fetch errors and retries up to max attempts', async () => {
    global.fetch
      .mockRejectedValueOnce(mockData.error.generate)
      .mockRejectedValueOnce(mockData.error.generate)
      .mockRejectedValueOnce(mockData.error.generate);

    render(<GeneratePage />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Error prompt' } });
    const button = screen.getByRole('button', { name: /Generate & Search/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to generate recipe after retries')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(3); // Max retries
    }, { timeout: 2000 });
  });
});