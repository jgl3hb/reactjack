import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { useDeck } from './hooks/useDeck';

jest.mock('./hooks/useDeck');

describe('app round flow', () => {
  test('supports selecting cpu count and identities on launch', async () => {
    useDeck.mockReturnValue({
      drawCard: jest.fn(() => 'd02'),
      resetDeck: jest.fn(),
      cardsRemaining: 300
    });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: /alice/i }));
    fireEvent.click(screen.getByRole('button', { name: /chuck/i }));
    fireEvent.click(screen.getByRole('button', { name: /start table/i }));

    await waitFor(() => {
      expect(screen.queryByText(/cpu lineup setup/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Alice \(Basic Strategy\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Chuck \(Card Counter\)/i)).toBeInTheDocument();
    });
  });

  test('deducts bets correctly on initial deal without crashing', async () => {
    const sequence = ['d05', 'c06', 'h10', 's09', 'd02', 'c03', 'h04', 's05'];
    const drawCard = jest.fn(() => sequence.shift() || 'd02');

    useDeck.mockReturnValue({
      drawCard,
      resetDeck: jest.fn(),
      cardsRemaining: 300
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start table/i }));

    fireEvent.click(screen.getByRole('button', { name: /\$25/i }));
    fireEvent.click(screen.getByRole('button', { name: /deal/i }));

    await waitFor(() => {
      expect(screen.getByText(/banks:/i)).toHaveTextContent('You $475');
    });

    expect(screen.queryByText(/cannot read properties of null/i)).not.toBeInTheDocument();
  });

  test('allows insurance before dealer peek blackjack resolution', async () => {
    const sequence = ['hA', 'sK', 'd10', 'c09'];
    const drawCard = jest.fn(() => sequence.shift() || 'd02');

    useDeck.mockReturnValue({
      drawCard,
      resetDeck: jest.fn(),
      cardsRemaining: 300
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start table/i }));

    fireEvent.click(screen.getByRole('button', { name: /\$25/i }));
    fireEvent.click(screen.getByRole('button', { name: /deal/i }));

    expect(await screen.findByRole('button', { name: /take insurance/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /take insurance/i }));

    await waitFor(() => {
      expect(screen.getByText(/banks:/i)).toHaveTextContent('You $499');
    });
  });

  test('shows visible card counter tracker and updates after deal', async () => {
    const sequence = ['h10', 's06', 'd09', 'c07', 'h05', 'd02', 'c02', 'sK', 'dA', 'c10', 'h03', 's04'];
    const drawCard = jest.fn(() => sequence.shift() || 'd02');

    useDeck.mockReturnValue({
      drawCard,
      resetDeck: jest.fn(),
      cardsRemaining: 300
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start table/i }));

    fireEvent.click(screen.getByRole('button', { name: /\$25/i }));
    fireEvent.click(screen.getByRole('button', { name: /deal/i }));
    await waitFor(() => {
      expect(screen.getByText(/counter tracker/i)).toBeInTheDocument();
      expect(screen.getByText(/running count/i)).toBeInTheDocument();
    });
  });
});
