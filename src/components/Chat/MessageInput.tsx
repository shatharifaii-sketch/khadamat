import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput = ({ 
  onSendMessage, 
  isSending, 
  disabled = false,
  placeholder = "اكتب رسالتك..." 
}: MessageInputProps) => {
  const [messageText, setMessageText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!messageText.trim() || isSending || disabled) {
      return;
    }

    const content = messageText.trim();
    setMessageText('');
    
    try {
      await onSendMessage(content);
    } catch (error) {
      // Re-populate the text if sending failed
      setMessageText(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageText]);

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        ref={textareaRef}
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        disabled={isSending || disabled}
        className="text-right resize-none min-h-[40px] max-h-[120px]"
        rows={1}
      />
      <Button
        onClick={handleSubmit}
        disabled={!messageText.trim() || isSending || disabled}
        size="icon"
        className="shrink-0"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default MessageInput;