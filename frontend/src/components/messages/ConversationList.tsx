import { Conversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: number;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-gray-500">Nie masz jeszcze żadnych konwersacji.</p>
        <p className="text-sm text-gray-400 mt-2">
          Rozpocznij rozmowę z sąsiadem, klikając "Wyślij wiadomość" w profilu użytkownika.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`flex items-start gap-3 p-4 border-b hover:bg-gray-50 transition-colors text-left ${
            selectedConversationId === conversation.id ? 'bg-blue-50 hover:bg-blue-100' : ''
          }`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {conversation.otherUserAvatarUrl ? (
              <img
                src={conversation.otherUserAvatarUrl}
                alt={conversation.otherUserName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">
                  {conversation.otherUserName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Conversation info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold text-gray-900 truncate">
                {conversation.otherUserName}
              </h3>
              {conversation.lastMessageSentAt && (
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatDistanceToNow(new Date(conversation.lastMessageSentAt), {
                    addSuffix: true,
                    locale: pl,
                  })}
                </span>
              )}
            </div>

            {conversation.lastMessageContent && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {conversation.lastMessageContent}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
