import axiosBase from '../../services/axiosConfig';

export const getAnswers = async (questionId) => {
  const response = await axiosBase.get(`/answer/getAnswers/${questionId}`);
  return response.data;
};

export const postAnswer = async (questionId, answerContent) => {
  const response = await axiosBase.post('/answer/postAnswer', {
    questionid: questionId,
    answer: answerContent,
  });
  return response.data;
};
