import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableTalkLog from './TableTalkLog';
import SpeechBubble from './SpeechBubble';

describe('Banter and dialogue components', () => {
  test('SpeechBubble renders quote text with proper character border styling', () => {
    const { rerender } = render(<SpeechBubble text="Let it ride!" characterId="bob" />);
    expect(screen.getByText(/"Let it ride!"/i)).toBeInTheDocument();

    rerender(<SpeechBubble text={null} characterId="bob" />);
    expect(screen.queryByText(/"Let it ride!"/i)).not.toBeInTheDocument();
  });

  test('TableTalkLog toggles open and shows message history', () => {
    const messages = [
      { id: '1', speaker: 'Bob', characterId: 'bob', text: 'Time to let it ride!', time: '5:30:00 PM' },
      { id: '2', speaker: 'Alice', characterId: 'alice', text: 'Clean math.', time: '5:30:05 PM' }
    ];
    const onToggle = jest.fn();
    const onClear = jest.fn();

    const { rerender } = render(
      <TableTalkLog messages={messages} isOpen={false} onToggle={onToggle} onClear={onClear} />
    );

    expect(screen.getByRole('button', { name: /table banter/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /table banter/i }));
    expect(onToggle).toHaveBeenCalled();

    rerender(
      <TableTalkLog messages={messages} isOpen={true} onToggle={onToggle} onClear={onClear} />
    );

    expect(screen.getByText('Time to let it ride!')).toBeInTheDocument();
    expect(screen.getByText('Clean math.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
