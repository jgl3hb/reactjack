import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardCountingTrainer from './CardCountingTrainer';

describe('CardCountingTrainer component', () => {
  const defaultProps = {
    runningCount: 4,
    trueCount: 1.5,
    cardsSeen: 60,
    decksRemaining: 2.7,
    cardsRemaining: 140,
    showCardTags: true,
    onToggleCardTags: jest.fn(),
    quizMode: false,
    onToggleQuizMode: jest.fn()
  };

  test('renders running count, true count, and decks remaining in tutor mode', () => {
    render(<CardCountingTrainer {...defaultProps} />);

    expect(screen.getByText(/counter tracker \(hi-lo\)/i)).toBeInTheDocument();
    expect(screen.getByText('+4')).toBeInTheDocument();
    expect(screen.getByText('+1.5')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('2.70')).toBeInTheDocument();
  });

  test('calls onToggleCardTags when badge toggle clicked', () => {
    render(<CardCountingTrainer {...defaultProps} />);

    const badgeBtn = screen.getByRole('button', { name: /card badges/i });
    fireEvent.click(badgeBtn);
    expect(defaultProps.onToggleCardTags).toHaveBeenCalledTimes(1);
  });

  test('calls onToggleQuizMode when quiz toggle clicked', () => {
    render(<CardCountingTrainer {...defaultProps} />);

    const quizBtn = screen.getByRole('button', { name: /quiz mode/i });
    fireEvent.click(quizBtn);
    expect(defaultProps.onToggleQuizMode).toHaveBeenCalledTimes(1);
  });

  test('opens and closes Coach Advice modal', () => {
    render(<CardCountingTrainer {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /coach advice/i }));
    expect(screen.getByText(/chuck's counting analysis/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back to table/i }));
    expect(screen.queryByText(/chuck's counting analysis/i)).not.toBeInTheDocument();
  });

  test('opens and closes Hi-Lo Guide modal', () => {
    render(<CardCountingTrainer {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /hi-lo guide/i }));
    expect(screen.getByText(/hi-lo card counting system/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close guide/i }));
    expect(screen.queryByText(/hi-lo card counting system/i)).not.toBeInTheDocument();
  });

  test('evaluates quiz mode answer submission correctly', () => {
    render(<CardCountingTrainer {...defaultProps} quizMode={true} />);

    expect(screen.getByText(/quiz mode active: count is hidden/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/your running count/i);
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: /submit check/i }));

    expect(screen.getByText(/spot on! running count is exactly \+4/i)).toBeInTheDocument();
  });
});
