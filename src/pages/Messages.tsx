
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, User, Loader2, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';

import { useConversations } from '@/hooks/useConversations';
import { useProviderConversations } from '@/hooks/useProviderConversations';
import { useAuth } from '@/contexts/AuthContext';
import ChatDialog from '@/components/Chat/ChatDialog';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import type { Conversation } from '@/hooks/useConversations';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { user, loading } = useAuth();
  const { getConversations } = useConversations();
  const { data: providerConversations = [] } = useProviderConversations();

  const clientConversations = getConversations.data || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <User size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-2xl font-bold mb-2">تسجيل الدخول مطلوب</h2>
                <p className="text-muted-foreground text-large mb-6">
                  يجب تسجيل الدخول لعرض رسائلك
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg">تسجيل الدخول</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg">العودة للرئيسية</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Combine all conversations and add type indicators
  const allConversations: (Conversation & { conversationType: 'client' | 'provider' })[] = [
    ...clientConversations.map(conv => ({ ...conv, conversationType: 'client' as const })),
    ...providerConversations.map(conv => ({ ...conv, conversationType: 'provider' as const }))
  ].sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  const handleOpenChat = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowChat(true);
  };

  const selectedConv = allConversations.find(c => c.id === selectedConversation);

  // Helper function to get the other party's name and service context
  const getConversationDetails = (conversation: typeof allConversations[0]) => {
    if (conversation.conversationType === 'client') {
      // User is the client, show provider name
      return {
        otherPartyName: conversation.profiles?.full_name || 'مقدم الخدمة',
        context: `محادثة حول: ${conversation.services?.title || 'خدمة محذوفة'}`,
        roleLabel: 'استفسار أرسلته'
      };
    } else {
      // User is the provider, show client name
      return {
        otherPartyName: conversation.profiles?.full_name || 'عميل',
        context: `استفسار حول: ${conversation.services?.title || 'خدمة محذوفة'}`,
        roleLabel: 'استفسار وارد'
      };
    }
  };

  const isLoading = getConversations.isLoading;

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/account">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للحساب
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              الرسائل
            </h1>
            <p className="text-muted-foreground">
              جميع محادثاتك واستفساراتك في مكان واحد
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : allConversations.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <MessageCircle size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold mb-2">لا توجد محادثات</h2>
                <p className="text-muted-foreground mb-6">
                  لم تبدأ أي محادثات بعد. ابحث عن خدمة أو انتظر استفسارات العملاء!
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Link to="/find-service">
                  <Button>ابحث عن خدمة</Button>
                </Link>
                <Link to="/post-service">
                  <Button variant="outline">أضف خدمة</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {allConversations.map((conversation) => {
              const details = getConversationDetails(conversation);
              return (
                <Card 
                  key={conversation.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleOpenChat(conversation.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-right">
                        <div className="flex items-center gap-2 justify-end mb-2">
                          <Badge 
                            variant={conversation.conversationType === 'provider' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {details.roleLabel}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-2">
                          {details.context}
                        </CardTitle>
                        <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground mb-2">
                          <span>{conversation.conversationType === 'provider' ? 'من' : 'مع'}: {details.otherPartyName}</span>
                          <User size={14} />
                        </div>
                        <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(conversation.last_message_at), {
                              addSuffix: true,
                              locale: ar
                            })}
                          </span>
                          <Clock size={14} />
                        </div>
                      </div>
                      <Badge 
                        variant={conversation.status === 'active' ? 'default' : 'secondary'}
                        className="mr-4"
                      >
                        {conversation.status === 'active' ? 'نشطة' : 'مؤرشفة'}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      

      {selectedConv && (
        <ChatDialog
          open={showChat}
          onOpenChange={setShowChat}
          conversationId={selectedConversation}
          serviceName={selectedConv.services?.title || 'خدمة محذوفة'}
          providerName={getConversationDetails(selectedConv).otherPartyName}
        />
      )}
    </div>
  );
};

export default Messages;
