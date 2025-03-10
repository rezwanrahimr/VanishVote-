const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const { nanoid } = require('nanoid');

// Create a new poll
router.post('/', async (req, res) => {
  try {
    const { question, options, expiresIn, hideResults, isPrivate, pollType } = req.body;
    
    // Calculate expiration time based on user selection
    let expirationHours;
    if (expiresIn === '1hour') expirationHours = 1;
    else if (expiresIn === '12hours') expirationHours = 12;
    else expirationHours = 24; // Default to 24 hours
    
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    
    // Generate a unique link
    const uniqueLink = nanoid(10);
    
    // Format options for the database
    const formattedOptions = options.map(option => ({
      text: option,
      votes: 0
    }));
    
    // Create new poll
    const newPoll = new Poll({
      question,
      options: formattedOptions,
      expiresAt,
      hideResults,
      isPrivate,
      pollType,
      uniqueLink
    });
    
    await newPoll.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: newPoll._id,
        uniqueLink: newPoll.uniqueLink,
        expiresAt: newPoll.expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Get a poll by its unique link
router.get('/link/:uniqueLink', async (req, res) => {
  try {
    const poll = await Poll.findOne({ uniqueLink: req.params.uniqueLink });
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found or has expired'
      });
    }
    
    // Check if poll has expired
    if (new Date() > new Date(poll.expiresAt)) {
      return res.status(404).json({
        success: false,
        error: 'Poll has expired'
      });
    }
    
    // If hideResults is true and poll hasn't ended yet, don't show votes
    const response = {
      ...poll.toObject(),
      isActive: true
    };
    
    if (poll.hideResults && new Date() < new Date(poll.expiresAt)) {
      response.options = poll.options.map(option => ({
        ...option,
        votes: undefined
      }));
    }
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Vote on a poll
router.post('/:id/vote', async (req, res) => {
  try {
    const { optionIndex } = req.body;
    
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }
    
    // Check if poll has expired
    if (new Date() > new Date(poll.expiresAt)) {
      return res.status(400).json({
        success: false,
        error: 'Poll has expired'
      });
    }
    
    // Increment the vote count for the selected option
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    
    await poll.save();
    
    // Return poll data, respecting hideResults setting
    const response = { ...poll.toObject() };
    
    if (poll.hideResults && new Date() < new Date(poll.expiresAt)) {
      response.options = poll.options.map(option => ({
        ...option,
        votes: undefined
      }));
    }
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Add reaction to a poll
router.post('/:id/react', async (req, res) => {
  try {
    const { reactionType } = req.body; // 'like' or 'trending'
    
    if (!['like', 'trending'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reaction type'
      });
    }
    
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }
    
    // Increment the appropriate reaction counter
    if (reactionType === 'like') {
      poll.reactions.likes += 1;
    } else {
      poll.reactions.trending += 1;
    }
    
    await poll.save();
    
    res.status(200).json({
      success: true,
      data: {
        reactions: poll.reactions
      }
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Add a comment to a poll
router.post('/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required'
      });
    }
    
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }
    
    // Add the new comment
    poll.comments.push({
      text,
      createdAt: new Date()
    });
    
    await poll.save();
    
    res.status(200).json({
      success: true,
      data: {
        comments: poll.comments
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Get recently created public polls (for homepage)
router.get('/recent', async (req, res) => {
  try {
    const recentPolls = await Poll.find({ 
      isPrivate: false,
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('question createdAt expiresAt totalVotes reactions');
    
    res.status(200).json({
      success: true,
      data: recentPolls
    });
  } catch (error) {
    console.error('Error fetching recent polls:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router;