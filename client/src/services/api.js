import axios from "axios";

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const pollService = {
  // Create a new poll
  createPoll: async (pollData) => {
    const response = await apiClient.post("/polls", pollData);
    return response.data;
  },

  // Get a poll by its unique link
  getPollByLink: async (uniqueLink) => {
    const response = await apiClient.get(`/polls/link/${uniqueLink}`);
    return response.data;
  },

  // Vote on a poll
  votePoll: async (pollId, optionIndex) => {
    const response = await apiClient.post(`/polls/${pollId}/vote`, {
      optionIndex,
    });
    return response.data;
  },

  // Add a reaction to a poll
  reactToPoll: async (pollId, reactionType) => {
    const response = await apiClient.post(`/polls/${pollId}/react`, {
      reactionType,
    });
    return response.data;
  },

  // Add a comment to a poll
  commentOnPoll: async (pollId, text) => {
    const response = await apiClient.post(`/polls/${pollId}/comment`, { text });
    return response.data;
  },

  // Get recent public polls
  getRecentPolls: async () => {
    const response = await apiClient.get("/polls/recent");
    return response.data;
  },
};
