// The entry point of your application.

require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5500;
const cors = require("cors");

// db connection
const dbConnection = require("./config/dbConfig");

// routes middleware
const userRoute = require("./routes/userRoute");
const questionRoute = require("./routes/questionRoute");
const answerRoute = require("./routes/answerRoute");

app.use(cors());
app.use(express.json());

// user routes
app.use("/api/user", userRoute);

// question routes
app.use("/api/question", questionRoute);

// answer routes
app.use("/api/answer", answerRoute);

app.get("/", (req, res) => res.send("Evangadi Forum API running..."));
// --- TABLE CREATION LOGIC ---
async function createTables() {
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS users (
        userid INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(20) NOT NULL,
        firstname VARCHAR(20) NOT NULL,
        lastname VARCHAR(20) NOT NULL,
        email VARCHAR(40) NOT NULL,
        password VARCHAR(100) NOT NULL,
        PRIMARY KEY (userid)
    )`,
    `CREATE TABLE IF NOT EXISTS questions (
     id INT(11) NOT NULL AUTO_INCREMENT,
    questionid VARCHAR(100) NOT NULL,
    userid INT(11) NOT NULL,
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    tag VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY (questionid),
    FOREIGN KEY (userid) REFERENCES users(userid)
    )`,
    `CREATE TABLE IF NOT EXISTS answers (
      answerid INT(11) NOT NULL AUTO_INCREMENT,
    userid INT(11) NOT NULL,
    questionid VARCHAR(100) NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (answerid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (questionid) REFERENCES questions(questionid) ON DELETE CASCADE
    )`,
  ];

  for (let query of tableQueries) {
    try {
      await dbConnection.query(query);
    } catch (err) {
      console.log("Error creating a specific table:", err.message);
    }
  }
}

// --- DATABASE CONNECTION & SERVER START ---
async function start() {
  try {
    // 1. Check if database is reachable
    await dbConnection.execute("select 'test' ");
    console.log("Database connection established");

    // 2. Run the table creation logic
    await createTables();
    console.log("Database tables verified/created");

    // 3. Start listening
    app.listen(port, () => {
      console.log(`Server running`);
      // console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Error during initialization:", error.message);
  }
}

start();
