import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check that loading or main content appears
    const content = screen.queryByText(/Loading|JS Fireplace/);
    expect(content).not.toBeNull();
  });

  it('displays the app title', () => {
    render(<App />);
    expect(screen.getByText('JS Fireplace')).toBeInTheDocument();
  });

  it('displays Hearthstone Simulator subtitle', () => {
    render(<App />);
    expect(screen.getByText('Hearthstone Simulator')).toBeInTheDocument();
  });

  it('shows turn indicator', () => {
    render(<App />);
    // Turn should be shown in status bar
    expect(screen.getByText(/Turn:/)).toBeInTheDocument();
  });

  it('has End Turn button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();
  });

  it('has Concede button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Concede/i })).toBeInTheDocument();
  });

  it('has New Game button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument();
  });

  it('shows action log panel', () => {
    render(<App />);
    expect(screen.getByText('Action Log')).toBeInTheDocument();
  });
});
