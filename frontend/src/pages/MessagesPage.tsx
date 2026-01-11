import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Conversation, ConversationDetail } from '../types';
import { messageApi } from '../lib/api';
import { ConversationList } from '../components/messages/ConversationList';
import { ChatWindow } from '../components/messages/ChatWindow';

export function MessagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations list
  useEffect(() => {
    loadConversations();
  }, []);

  // Load specific conversation if userId is provided
  useEffect(() => {
    if (userId) {
      loadConversationWithUser(userId);
    }
  }, [userId]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await messageApi.getMyConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Nie udało się załadować konwersacji');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationWithUser = async (otherUserId: string) => {
    try {
      const data = await messageApi.getConversationWithUser(otherUserId);
      setSelectedConversation(data);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      alert('Nie udało się załadować konwersacji');
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/messages?userId=${conversation.otherUserId}`);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      await messageApi.sendMessage({
        recipientId: selectedConversation.otherUserId,
        content,
      });

      // Reload conversation to get the new message
      await loadConversationWithUser(selectedConversation.otherUserId);

      // Reload conversations list to update last message
      await loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Ładowanie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Wiadomości</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Sidebar - Conversation List (30%) */}
            <div className="w-full md:w-1/3 border-r h-full overflow-hidden">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
              />
            </div>

            {/* Chat Window (70%) */}
            <div className="hidden md:flex md:w-2/3 h-full">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <div className="flex items-center justify-center w-full">
                  <p className="text-gray-500">Wybierz konwersację, aby rozpocząć czat</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile view - show chat window when conversation is selected */}
        {selectedConversation && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
            <ChatWindow
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
