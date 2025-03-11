import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTimes, FaLink, FaClock, FaEye, FaLock } from 'react-icons/fa';
import { pollService } from '../services/api';

const CreatePollPage = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollType, setPollType] = useState('multiple-choice');
  const [expiresIn, setExpiresIn] = useState('24hours');
  const [hideResults, setHideResults] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default options for yes/no poll
  const handlePollTypeChange = (type) => {
    setPollType(type);
    if (type === 'yes-no') {
      setOptions(['Yes', 'No']);
    } else if (options.length === 2 && options[0] === 'Yes' && options[1] === 'No') {
      setOptions(['', '']);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const validateForm = () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return false;
    }

    if (pollType === 'multiple-choice') {
      if (options.some(option => !option.trim())) {
        setError('Please fill all options');
        return false;
      }

      if (new Set(options.map(o => o.trim())).size !== options.length) {
        setError('All options must be unique');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const pollData = {
        question,
        options: pollType === 'yes-no' ? ['Yes', 'No'] : options,
        pollType,
        expiresIn,
        hideResults,
        isPrivate
      };
      
      const response = await pollService.createPoll(pollData);
      
      // Navigate to the new poll
      navigate(`/poll/${response.data.uniqueLink}`);
    } catch (err) {
      console.error('Error creating poll:', err);
      setError('Failed to create poll. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Poll</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Poll Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className={`btn ${pollType === 'multiple-choice' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handlePollTypeChange('multiple-choice')}
          >
            Multiple Choice
          </button>
          <button
            type="button"
            className={`btn ${pollType === 'yes-no' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handlePollTypeChange('yes-no')}
          >
            Yes/No
          </button>
        </div>
        
        {/* Question */}
        <div>
          <label htmlFor="question" className="block mb-2 font-medium">
            Poll Question
          </label>
          <input
            type="text"
            id="question"
            className="input"
            placeholder="Ask your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>
        
        {/* Options */}
        {pollType === 'multiple-choice' && (
          <div>
            <label className="block mb-2 font-medium">
              Options
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    className="input"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="ml-2 p-2 text-gray-500 hover:text-red-500"
                      onClick={() => removeOption(index)}
                      aria-label="Remove option"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
              
              {options.length < 10 && (
                <button
                  type="button"
                  className="flex items-center text-primary hover:text-blue-700"
                  onClick={addOption}
                >
                  <FaPlus className="mr-2" /> Add Option
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Expiration */}
        <div>
          <label className="block mb-2 font-medium">
            <FaClock className="inline mr-2" /> Poll Expiration
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              className={`btn ${expiresIn === '1hour' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setExpiresIn('1hour')}
            >
              1 Hour
            </button>
            <button
              type="button"
              className={`btn ${expiresIn === '12hours' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setExpiresIn('12hours')}
            >
              12 Hours
            </button>
            <button
              type="button"
              className={`btn ${expiresIn === '24hours' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setExpiresIn('24hours')}
            >
              24 Hours
            </button>
          </div>
        </div>
        
        {/* Settings */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hideResults"
              className="h-5 w-5 text-primary rounded"
              checked={hideResults}
              onChange={() => setHideResults(!hideResults)}
            />
            <label htmlFor="hideResults" className="ml-2">
              <FaEye className="inline mr-2" /> Hide results until poll expires
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              className="h-5 w-5 text-primary rounded"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            <label htmlFor="isPrivate" className="ml-2">
              <FaLock className="inline mr-2" /> Make poll private (only accessible via link)
            </label>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-full py-3 text-lg"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
              Creating Poll...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <FaLink className="mr-2" /> Create Poll
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatePollPage;