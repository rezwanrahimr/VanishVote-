import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { FaFire, FaThumbsUp } from 'react-icons/fa';

const HomePage = () => {
  const [recentPolls, setRecentPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentPolls = async () => {
      try {
        setLoading(true);
        const response = await pollService.getRecentPolls();
        setRecentPolls(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recent polls:', err);
        setError('Failed to fetch recent polls');
        setLoading(false);
      }
    };

    fetchRecentPolls();
  }, []);

  const renderTimeRemaining = (expiresAt) => {
    const expiration = new Date(expiresAt);
    const now = new Date();
    
    if (expiration <= now) {
      return 'Expired';
    }
    
    return `Expires ${formatDistanceToNow(expiration, { addSuffix: true })}`;
  };

  return (
    <div>
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to VanishVote</h1>
        <p className="text-lg mb-6">Create anonymous polls that disappear after a set time.</p>
        <Link to="/create" className="btn btn-primary text-lg px-6 py-3">
          Create Your Poll
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Recent Public Polls</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-danger">{error}</div>
        ) : recentPolls.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPolls.map((poll) => (
              <Link 
                key={poll._id}
                to={`/poll/${poll.uniqueLink}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-xl mb-2 line-clamp-2">{poll.question}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  {renderTimeRemaining(poll.expiresAt)}
                </p>
                <div className="flex justify-between text-sm">
                  <span>{poll.totalVotes} votes</span>
                  <div className="flex space-x-3">
                    <span className="flex items-center">
                      <FaThumbsUp className="text-primary mr-1" /> {poll.reactions.likes}
                    </span>
                    <span className="flex items-center">
                      <FaFire className="text-orange-500 mr-1" /> {poll.reactions.trending}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No public polls available right now. Be the first to create one!
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;