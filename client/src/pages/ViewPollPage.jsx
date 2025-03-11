import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pollService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaLink, 
  FaClock, 
  FaFire, 
  FaThumbsUp, 
  FaComments, 
  FaPaperPlane 
} from 'react-icons/fa';

const ViewPollPage = () => {
  const { uniqueLink } = useParams();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        const response = await pollService.getPollByLink(uniqueLink);
        setPoll(response.data);
        setLoading(false);
        
        // Check if user has voted (could use localStorage for this)
        const hasVotedStorage = localStorage.getItem(`voted_${response.data._id}`);
        if (hasVotedStorage) {
          setHasVoted(true);
        }
      } catch (err) {
        console.error('Error fetching poll:', err);
        setError(err.response?.data?.error || 'Failed to fetch poll');
        setLoading(false);
      }
    };

    fetchPoll();
  }, [uniqueLink]);

  const handleVote = async () => {
    if (selectedOption === null || hasVoted) return;
    
    try {
      const response = await pollService.votePoll(poll._id, selectedOption);
      setPoll(response.data);
      setHasVoted(true);
      localStorage.setItem(`voted_${poll._id}`, 'true');
      setMessage({ type: 'success', text: 'Your vote has been recorded!' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error voting:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to record your vote'
      });
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      const response = await pollService.reactToPoll(poll._id, reactionType);
      setPoll({
        ...poll,
        reactions: response.data.reactions
      });
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    try {
      const response = await pollService.commentOnPoll(poll._id, comment);
      setPoll({
        ...poll,
        comments: response.data.comments
      });
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setMessage({
        type: 'error',
        text: 'Failed to add comment'
      });
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setMessage({ type: 'success', text: 'Link copied to clipboard!' });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const calculatePercentage = (votes) => {
    if (!poll || poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-danger mb-4">
          {error === 'Poll not found or has expired' ? 'Poll Not Found' : 'Error'}
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {error === 'Poll not found or has expired' 
            ? 'This poll may have expired or never existed.'
            : error}
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  if (!poll) return null;

  const isExpired = new Date() > new Date(poll.expiresAt);
  const shouldShowResults = !poll.hideResults || isExpired || hasVoted;

  return (
    <div className="max-w-2xl mx-auto">
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border-l-4 border-green-500' 
            : 'bg-red-100 text-red-700 border-l-4 border-red-500'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{poll.question}</h1>
          <button 
            onClick={copyLinkToClipboard}
            className="p-2 text-gray-500 hover:text-primary"
            aria-label="Copy link"
            title="Copy link to clipboard"
          >
            <FaLink />
          </button>
        </div>
        
        <div className="mb-6 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <FaClock className="mr-1" />
          {isExpired 
            ? 'This poll has expired' 
            : `Expires ${formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })}`}
        </div>
        
        <div className="space-y-3 mb-6">
          {poll.options.map((option, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex items-center mb-1">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="poll-option"
                  className="h-4 w-4 text-primary"
                  disabled={isExpired || hasVoted}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                />
                <label htmlFor={`option-${index}`} className="ml-2 flex-grow font-medium">
                  {option.text}
                </label>
                {shouldShowResults && (
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {option.votes} ({calculatePercentage(option.votes)}%)
                  </span>
                )}
              </div>
              
              {shouldShowResults && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${calculatePercentage(option.votes)}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!isExpired && !hasVoted && (
          <button 
            onClick={handleVote}
            className="btn btn-primary w-full mb-4"
            disabled={selectedOption === null}
          >
            Vote
          </button>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleReaction('like')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary"
            >
              <FaThumbsUp className="mr-1" /> {poll.reactions.likes}
            </button>
            <button 
              onClick={() => handleReaction('trending')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500"
            >
              <FaFire className="mr-1" /> {poll.reactions.trending}
            </button>
          </div>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary"
          >
            <FaComments className="mr-1" /> {poll.comments.length} Comments
          </button>
        </div>
      </div>
      
      {showComments && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex">
              <input
                type="text"
                className="input flex-grow"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button 
                type="submit"
                className="btn btn-primary ml-2"
                disabled={!comment.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
          
          {poll.comments.length > 0 ? (
            <div className="space-y-4">
              {poll.comments.map((comment, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <p className="mb-1">{comment.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No comments yet. Be the first to add one!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewPollPage;