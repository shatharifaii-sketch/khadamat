import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, User, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { ConversationDetail } from '@/hooks/useOptimizedConversations';

interface ConversationCardProps {
  conversation: ConversationDetail;
  onOpenChat: (conversationId: string) => void;
  getConversationDetails: (conversation: any) => {
    otherPartyName: string;
    context: string;
    roleLabel: string;
  };
}

const ConversationCard = ({ conversation, onOpenChat, getConversationDetails }: ConversationCardProps) => {
  const details = getConversationDetails(conversation);

  return (
    <Card 
      className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
      onClick={() => onOpenChat(conversation.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 text-right space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <Badge 
                variant={conversation.conversation_type === 'provider' ? 'default' : 'secondary'}
                className="text-xs font-medium"
              >
                {details.roleLabel}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
              {details.context}
            </CardTitle>
            <CardDescription className="text-base">
              <div className="flex items-center gap-2 justify-end mb-2">
                <span className="font-medium">
                  {conversation.conversation_type === 'provider' ? 'من' : 'مع'}: {details.otherPartyName}
                </span>
                <User size={16} className="text-primary" />
              </div>
              <div className="flex items-center gap-2 justify-end text-sm">
                <span>
                  {formatDistanceToNow(new Date(conversation.last_message_at), {
                    addSuffix: true,
                    locale: ar
                  })}
                </span>
                <Clock size={14} />
              </div>
            </CardDescription>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Badge 
              variant={conversation.status === 'active' ? 'default' : 'secondary'}
              className="whitespace-nowrap"
            >
              {conversation.status === 'active' ? 'نشطة' : 'مؤرشفة'}
            </Badge>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ConversationCard;