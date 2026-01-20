const dbConnection = require('../config/dbConfig');
const { StatusCodes } = require('http-status-codes');

async function postAnswer(req, res) {
  const { questionid, answer } = req.body;
  const userid = req.user.userid;

  if (!questionid || !answer) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Please provide all fields' }); //
  }

  try {
    await dbConnection.query(
      'INSERT INTO answers (userid, questionid, answer) VALUES (?, ?, ?)',
      [userid, questionid, answer],
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: 'Answer posted successfully' }); //
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Something went wrong, try again later' });
  }
}

async function getAnswers(req, res) {
  // Grab the question_id from the URL parameters
  const { question_id } = req.params;

  try {
    // SQL Logic: We JOIN with the users table to get the 'username' of the person who answered
   const [answers] = await dbConnection.query(
     `SELECT answers.answerid, answers.answer, answers.created_at, users.username
   FROM answers
   JOIN users ON answers.userid = users.userid
   WHERE answers.questionid = ?
   ORDER BY answers.answerid DESC`,
     [question_id],
   );

    return res.status(StatusCodes.OK).json({ answers });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Something went wrong, try again later' });
  }
}

module.exports = { postAnswer, getAnswers };
