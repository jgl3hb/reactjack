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

  test('allows human player to stand, displays stood badge, and resolves round', async () => {
    // Sequence:
    // Dealer: [d07, d08] = 15 -> hits d05 = 20
    // Human: [h10, s08] = 18 -> stands with 18 -> loses to 20
    const sequence = ['d07', 'h10', 'd08', 's08', 'd05'];
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

    const standBtn = await screen.findByRole('button', { name: /stand/i });
    expect(standBtn).not.toBeDisabled();

    fireEvent.click(standBtn);

    await waitFor(() => {
      expect(screen.getByText(/STOOD/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new round/i })).toBeInTheDocument();
    });
  });

  test('supports keyboard shortcuts S for stand and Space for new round', async () => {
    const sequence = ['d10', 'h10', 'd07', 's09'];
    const drawCard = jest.fn(() => sequence.shift() || 'd02');

    useDeck.mockReturnValue({
      drawCard,
      resetDeck: jest.fn(),
      cardsRemaining: 300
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start table/i }));
    fireEvent.click(screen.getByRole('button', { name: /\$25/i }));

    // Deal via Space
    fireEvent.keyDown(window, { key: ' ' });

    const standBtn = await screen.findByRole('button', { name: /stand/i });
    expect(standBtn).not.toBeDisabled();

    // Stand via S key
    fireEvent.keyDown(window, { key: 's' });

    await waitFor(() => {
      expect(screen.getByText('LOST')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /new round/i })).toBeInTheDocument();
    });

    // Start next round via Space key
    fireEvent.keyDown(window, { key: ' ' });

    await waitFor(() => {
      expect(screen.getAllByText(/Place your bet/i).length).toBeGreaterThan(0);
    });
  });
});

