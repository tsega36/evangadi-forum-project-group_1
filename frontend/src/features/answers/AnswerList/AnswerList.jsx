import { CircleUser } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import axios from '../../../api/axios';
import classes from './AnswerList.module.css';

const PAGE_SIZE = 5;

const AnswerList = ({ questionId, onAiSummarize, aiSummary, aiLoading }) => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [posting, setPosting] = useState(false);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAnswers = async () => {
    if (!questionId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/answer/${questionId}`);
      setAnswers(res.data.answers || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load answers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [questionId]);

  // reset page when answers change
  useEffect(() => {
    setCurrentPage(1);
  }, [answers.length]);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(answers.length / PAGE_SIZE));

  const pagedAnswers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return answers.slice(start, start + PAGE_SIZE);
  }, [answers, currentPage]);

  const changePage = (p) =>
    setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // post answer
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return alert('Please type an answer');

    setPosting(true);
    try {
      await axios.post(`/api/answer/postAnswer`, {
        questionid: questionId,
        answer: newAnswer,
      });
      setNewAnswer('');
      fetchAnswers();
    } catch (err) {
      console.error(err);
      alert('Failed to post answer');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <p>Loading answers...</p>;
  if (error) return <p className={classes.error}>{error}</p>;

  return (
    <section className={classes.answersSection}>
      {/* AI summary */}
      <button
        onClick={() => onAiSummarize(answers)}
        className={classes.aiButton}
        disabled={aiLoading || answers.length === 0}
      >
        {aiLoading ? 'AI is thinking...' : 'Summarize Discussion'}
      </button>

      {aiSummary && (
        <div className={classes.aiSummaryBox}>
          <h3>AI Summary</h3>
          <p>{aiSummary}</p>
        </div>
      )}

      {/* answers */}
      <div className={classes.answerList}>
        {pagedAnswers.length === 0 ? (
          <p className={classes.noAnswer}>
            No answers yet. Be the first to answer.
          </p>
        ) : (
          pagedAnswers.map((ans) => (
            <div key={ans.answerid} className={classes.answerCard}>
              <div className={classes.userInfo}>
                <CircleUser size={36} strokeWidth={1.5} />
                <div>
                  <span className={classes.user}>{ans.username}</span>
                  <span className={classes.date}>
                    {new Date(ans.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className={classes.answerText}>{ans.answer}</p>
            </div>
          ))
        )}
      </div>

      {/* pagination UI */}
      {totalPages > 1 && (
        <div className={classes.pagination}>
          <button
            className={classes.pageBtn}
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${classes.pageBtn} ${p === currentPage ? classes.active : ''}`}
              onClick={() => changePage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className={classes.pageBtn}
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* post form */}
      <form onSubmit={handlePostAnswer} className={classes.answerForm}>
        <textarea
          rows="5"
          placeholder="Your answer..."
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
        />
        <button type="submit" disabled={posting}>
          {posting ? 'Posting...' : 'Post Answer'}
        </button>
      </form>
    </section>
  );
};

export default AnswerList;
