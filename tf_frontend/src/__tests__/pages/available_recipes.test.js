import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AvailableRecipesPage from '../../app/foodview/available/page'; // Adjust the import path as needed
import { useRouter } from 'next/navigation';
import React from 'react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock data for different scenarios
const mockData = {
  success: {
    recipes: [
      {
        id: '1',
        name: 'Spicy Basil Chicken',
        cover_image: 'https://example.com/spicy-basil.jpg',
        creator_name: 'Chef John',
        category: 'Main Dish',
        tags: ['spicy', 'chicken'],
      },
      {
        id: '2',
        name: 'Vegan Chocolate Cake',
        cover_image: 'https://example.com/cake.jpg',
        creator_name: 'Baker Jane',
        category: 'Dessert',
        tags: ['vegan', 'sweet'],
      },
    ],
    tags: ['spicy', 'vegan', 'sweet', 'chicken'],
    categories: ['Main Dish', 'Dessert'],
  },
  empty: {
    recipes: [],
    tags: [],
    categories: [],
  },
  error: {
    error: 'Failed to fetch recipes',
  },
};

describe('AvailableRecipesPage', () => {
  let pushMock;

  beforeEach(() => {
    pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });

    // Mock fetch globally
    global.fetch = jest.fn();

    // Mock window.scrollTo
    global.window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => new Promise((resolve) => setTimeout(() => resolve(mockData.success), 100)), // Simulate delay
    });

    render(<AvailableRecipesPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockData.error),
    });

    render(<AvailableRecipesPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch recipes')).toBeInTheDocument();
      expect(screen.queryByText('Available Recipes')).not.toBeInTheDocument();
    });
  });

  it('displays no recipes message when none are available', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData.empty),
    });

    render(<AvailableRecipesPage />);

    await waitFor(() => {
      expect(screen.getByText('No recipes available at the moment.')).toBeInTheDocument();
      expect(screen.queryByText('Spicy Basil Chicken')).not.toBeInTheDocument();
    });
  });

  

  



  it('navigates to recipe details on View Recipe click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData.success),
    });

    render(<AvailableRecipesPage />);

    await waitFor(() => {
      expect(screen.getByText('Spicy Basil Chicken')).toBeInTheDocument();
    });

    const viewButton = screen.getAllByText('View Recipe')[0];
    fireEvent.click(viewButton);

    expect(pushMock).toHaveBeenCalledWith('/foodview/users/1');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('navigates to tag page on tag chip click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData.success),
    });

    render(<AvailableRecipesPage />);

    await waitFor(() => {
      expect(screen.getByText('spicy')).toBeInTheDocument();
    });

    const spicyChip = screen.getByText('spicy');
    fireEvent.click(spicyChip);

    expect(pushMock).toHaveBeenCalledWith('/foodview/tags/spicy');
  });
});