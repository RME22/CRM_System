import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

const ActivityChat = ({ comments = [], onAddComment, disabled = false }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || disabled) return;
    
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <MessageCircle className="text-primary-600" size={24} />
        <h2 className="text-lg font-semibold text-gray-900">Activity Chat</h2>
      </div>

      {/* Chat History */}
      {comments && comments.length > 0 ? (
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {comments.map((comment, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 shadow-sm border transition-all hover:shadow-md ${
                comment.isSystemMessage
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-primary-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  comment.isSystemMessage
                    ? 'bg-primary-500'
                    : 'bg-primary-100'
                }`}>
                  <MessageCircle size={16} className={comment.isSystemMessage ? 'text-white' : 'text-primary-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      comment.isSystemMessage ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {comment.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm whitespace-pre-wrap break-words ${
                    comment.isSystemMessage ? 'text-gray-800 font-medium' : 'text-gray-700'
                  }`}>{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-4 bg-gray-50 rounded-lg border border-gray-200">
          <MessageCircle size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No comments yet. Start the conversation!</p>
        </div>
      )}

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a comment..."
          className="input flex-1"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || disabled}
          className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default ActivityChat;
