import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
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
    expect(screen.getByText(/Turn:/)).toBeInTheDocument();
  });

  it('shows current player indicator', () => {
    render(<App />);
    expect(screen.getByText(/Current Player:/)).toBeInTheDocument();
  });

  it('has End Turn button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();
  });

  it('has Concede button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Concede/i })).toBeInTheDocument();
  });

  it('shows action log panel', () => {
    render(<App />);
    expect(screen.getByText('Action Log')).toBeInTheDocument();
  });
});
