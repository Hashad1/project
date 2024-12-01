import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatContainer } from '../ChatContainer';

describe('ChatContainer', () => {
  const mockMessages = [
    { id: '1', text: 'Hello', isBot: false },
    { id: '2', text: 'Hi there!', isBot: true },
  ];

  it('renders messages correctly', () => {
    render(<ChatContainer messages={mockMessages} isStreaming={false} />);
    
    mockMessages.forEach(message => {
      expect(screen.getByText(message.text)).toBeInTheDocument();
    });
  });

  it('applies streaming class when message is streaming', () => {
    render(<ChatContainer messages={mockMessages} isStreaming={true} />);
    
    const lastMessage = screen.getByText(mockMessages[mockMessages.length - 1].text);
    expect(lastMessage.parentElement).toHaveClass('streaming');
  });
});
