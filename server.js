const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { message } = require('statuses');

const app = express();
app.use(express.json());
app.use(cors());




const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "quiz",
});

con.connect((err) => {
    if (err) {
        console.error("Error connecting to the database", err);
        return;
    }
    console.log("Connected to the database");
});

// Endpoint to handle user registration
app.post('/', (req, res) => {
    console.log("hii new user")
    res.json({message:"helloworldvercel"})
});
app.post('/register', (req, res) => {
    const { username, email, usermobile, password } = req.body;

    const checkExistUser = "SELECT * FROM user WHERE user_mobileno=?";
    con.query(checkExistUser, [usermobile], (err, results) => {
        if (err) {
            console.error("Error checking the user:", err);
            return res.status(500).json({ message: "Failed to register user" });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: "User with this mobile number already exists" });
        }

        const insertSql = "INSERT INTO user(user_name, user_email, user_password, user_mobileno) VALUES (?, ?, ?, ?)";
        con.query(insertSql, [username, email, password, usermobile], (err, result) => {
            if (err) {
                console.error("Error registering user:", err);
                return res.status(500).json({ message: "Failed to register user" });
            }
            console.log("User registered successfully");
            return res.status(200).json(result);
        });
    });
});

//login logic
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM user WHERE user_name = ? AND user_password = ?";
    con.query(query, [username, password], (err, result) => {
        if (err) {
            console.error("Error logging in user:", err);
            return res.status(500).json({ message: "Failed to login" });
        }

        if (result.length === 0) { 
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("User logged in successfully");
        return res.status(200).json(result);
    });
});

//evalutordetails
app.post('/evalsubmit', (req, res) => {
    const { username, password, email, phone, subjectname } = req.body;

    const sql = "INSERT INTO evaluator (evaluator_name, evaluator_email, evaluator_phonenumber, evaluator_subject, evaluator_password) VALUES (?, ?, ?, ?, ?)";
    con.query(sql, [username, email, phone, subjectname, password], (err, results) => {
        if (err) {
            console.error("Error uploading evaluator details:", err);
            return res.status(500).json({ message: "Error uploading evaluator details" });
        }
        console.log("Successfully uploaded evaluator details");
        return res.status(200).json(results);
    });
});

app.post('/evaluatorlogin',(req,res)=>{
    const{username,password}=req.body;
    const sql="select * from evaluator where evaluator_password=? and evaluator_name=?";
    con.query(sql,[password,username],(err,results)=>{
        if(err){
            console.error("while login the evaluator error occured",err);
            return res.status(500).json({message:"error occured while login the evaluator details"})
        }
        if(results.length===0){
            return res.status(400).json({ message: "Invalid credentials" });

        }
        console.log("sucessfully login the evaluator details")
        return res.status(200).json(results)
    })
})

app.get('/evaluatordetails',(req,res)=>{
    const sql="select * from evaluator";
    con.query(sql,(err,results)=>{
        if(err){
            console.error("while getting evaluator details error ocured",err)
            return res.status(500).json({message:"while getting evaluator details error occured"})
        }
        console.log("sucessfully getting evaluator details")
        return res.status(200).json(results)
    })
})

app.delete('/evaluatordelete/:evaluatorId', (req, res) => {
    const evaluatorid = req.params.evaluatorId;
    const sql = "DELETE FROM evaluator WHERE evaluator_id = ?";
    
    con.query(sql, [evaluatorid], (err, results) => {
        if (err) {
            console.log("Error occurred while deleting the evaluator record:", err);
            return res.status(500).json({ message: "Error occurred while deleting the evaluator record" });
        }
        console.log("Successfully deleted the evaluator record");
        return res.status(200).json(results);
    });
});

app.put('/editevaluator/:evaluatorid',(req,res)=>{
    const evaluatorId=req.params.evaluatorid;
    const{evaluator_name,evaluator_phonenumber,evaluator_email}=req.body
    const sql=`update evaluator set evaluator_name= ?,evaluator_email=?,evaluator_phonenumber=? where evaluator_id=?`
    con.query(sql,[evaluator_name,evaluator_email,evaluator_phonenumber,evaluatorId],(err,results)=>{
        if(err){
            console.error("error ocured while editing the evaluator details",err)
            return res.status(500).json({message:"error occured"})
        }
        console.log("sucessfully edit the record")
        return res.status(200).json(results)
    })
    
})



// Endpoint to fetch all admin details
app.get('/admindetails', (req, res) => {
    const sql = "SELECT * FROM user";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching admin details", err);
            return res.status(500).json({ message: "Failed to fetch admin details" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "No admin details found" });
        }
        console.log("Successfully fetched admin details");
        return res.status(200).json(result);
    });
});

// Endpoint to delete a user by user_id
app.delete('/deleteuser/:userId', (req, res) => {
    const userId = req.params.userId;
    const delSql = 'DELETE FROM user WHERE user_id=?';
    con.query(delSql, [userId], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).json({ message: "Failed to delete user" });
        }
        console.log("User deleted successfully");
        return res.status(200).json(result);
    });
});

// Endpoint to update user details
app.put('/edituser/:userId', (req, res) => {
    const userId = req.params.userId;
    const { user_name, user_password, user_email, user_mobileno } = req.body;

    // Check if the new email or mobile number already exists
    const checkDuplicate = `SELECT * FROM user WHERE (user_email=? OR user_mobileno=?) AND user_id <> ?`;
    con.query(checkDuplicate, [user_email, user_mobileno, userId], (err, results) => {
        if (err) {
            console.error("Error checking duplicates:", err);
            return res.status(500).json({ message: "Failed to update user" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Duplicate email or mobile number found" });
        }

        // Update user details
        const updateSql = `UPDATE user SET user_name=?, user_password=?, user_email=?, user_mobileno=? WHERE user_id=?`;
        con.query(updateSql, [user_name, user_password, user_email, user_mobileno, userId], (err, result) => {
            if (err) {
                console.error("Error updating user:", err);
                return res.status(500).json({ message: "Failed to update user" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found for update" });
            }

            console.log("User updated successfully");
            return res.status(200).json(result);
        });
    });
});

// Multer configuration for file upload
/*const storage = multer.diskStorage({
    destination: 'uploads/',  // File upload location
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // File name
    }
});
*/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        cb(null, `${timestamp}-${randomString}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Student registration
app.post('/studentregister', upload.single("student_image"), (req, res) => {
    const { studentname, password, email, birthdate, phone } = req.body;
    const student_image = req.file ? req.file.filename : null;

    const checkExistUser = "SELECT * FROM student1 WHERE phone_number=?";
    con.query(checkExistUser, [phone], (err, result) => {
        if (err) {
            console.error("Error checking the student:", err);
            return res.status(500).json({ message: "Failed to register student" });
        }
        if (result.length > 0) {
            return res.status(400).json({ message: "Student with this phone number is already registered" });
        }

        const insertSql = "INSERT INTO student1 (student_name, email, phone_number, date_of_birth, password, student_image) VALUES (?, ?, ?, ?, ?, ?)";
        con.query(insertSql, [studentname, email, phone, birthdate, password, student_image], (err, result) => {
            if (err) {
                console.error("Error registering student:", err);
                return res.status(500).json({ message: "Failed to register student" });
            }
            console.log("Student registered successfully");
            return res.status(200).json({ message: "Student registered successfully", studentId: result.insertId });
        });
    });
});
//student login

app.post('/studentlogin',(req,res)=>{
    const{username,password}=req.body
    const query = 'SELECT student_id, student_name, email, phone_number, date_of_birth, student_image FROM student1 WHERE STUDENT_NAME = ? AND password = ?';
    con.query(query,[username,password],(err,result)=>{
        if(err){
            console.error('error student login:',err);
            return res.status(500).json({message:"failed to login"});
            
        }
        if(result.length ===0){
            return res.status(400).json({message:"invalid credentails"})
        }else{
            console.log("user logged in successfully");
            res.status(200).send(result[0]);

        }
        
    })
})



// Endpoint to fetch all student details
app.get('/studentdetails', (req, res) => {
    const sql = "SELECT * FROM student1";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching student details", err);
            return res.status(500).json({ message: "Failed to fetch student details" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "No student details found" });
        }
        console.log("Successfully fetched student details");
        return res.status(200).json(result);
    });
});

app.get('/studentdetail/:studentId', (req, res) => {
    const student_id = req.params.studentId;
    const sql = "SELECT * FROM student1 WHERE student_id = ?";
    
    con.query(sql, [student_id], (err, result) => {
        if (err) {
            console.error("Error collecting student details:", err);
            return res.status(500).json({ message: "Error collecting student details" });
        }
        console.log("Successfully collected student details");
        return res.status(200).json(result);
    });
});


// Endpoint to delete a student by student_id
app.delete('/deletestudent/:student_id', (req, res) => {
    const student_id = req.params.student_id;
    const delsql = "DELETE FROM student1 WHERE student_id=?";
    con.query(delsql, [student_id], (err, result) => {
        if (err) {
            console.error("Error deleting student:", err);
            return res.status(500).json({ message: "Failed to delete student" });
        }
        console.log("Student deleted successfully");
        return res.status(200).json(result);
    });
});

// Endpoint to update student details
app.put('/editstudent/:student_id', upload.single("student_image"), (req, res) => {
    const student_id = req.params.student_id;
    const { studentname, password, email, birthdate, phone } = req.body;
    const student_image = req.file ? req.file.filename : null;

    // Check if the new email or mobile number already exists
    const checkDuplicate = `SELECT * FROM student1 WHERE (email=? OR phone_number=?) AND student_id <> ?`;
    con.query(checkDuplicate, [email, phone, student_id], (err, results) => {
        if (err) {
            console.error("Error checking duplicates:", err);
            return res.status(500).json({ message: "Failed to update student" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Duplicate email or phone number found" });
        }

        // Update student details
        let updateSql = `UPDATE student1 SET student_name=?, password=?, email=?, phone_number=?, date_of_birth=?`;
        const updateValues = [studentname, password, email, phone, birthdate];

        if (student_image) {
            updateSql += `, student_image=?`;
            updateValues.push(student_image);
        }

        updateSql += ` WHERE student_id=?`;
        updateValues.push(student_id);

        con.query(updateSql, updateValues, (err, result) => {
            if (err) {
                console.error("Error updating student:", err);
                return res.status(500).json({ message: "Failed to update student" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Student not found for update" });
            }

            console.log("Student updated successfully");
            return res.status(200).json(result);
        });
    });
});





//subject
// Endpoint to fetch all subjects
app.get('/subjects', (req, res) => {
    const sql = "SELECT * FROM subject";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching subjects", err);
            return res.status(500).json({ message: "Failed to fetch subjects" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "No subjects found" });
        }
        console.log("Successfully fetched subjects");
        return res.status(200).json(result);
    });
});

// Endpoint to add a new subject
app.post('/addsubject', (req, res) => {
    const { subject_name } = req.body;

    if (!subject_name) {
        return res.status(400).json({ message: "Subject name is required" });
    }

    const insertSql = "INSERT INTO subject (subject_name) VALUES (?)";
    con.query(insertSql, [subject_name], (err, result) => {
        if (err) {
            console.error("Error adding subject:", err);
            return res.status(500).json({ message: "Failed to add subject" });
        }
        console.log("Subject added successfully");
        return res.status(201).json({ message: "Subject added successfully", subjectId: result.insertId });
    });
});

// Endpoint to delete a subject by subject_id
app.delete('/deletesubject/:subjectId', (req, res) => {
    const subjectId = req.params.subjectId;
    const delSql = 'DELETE FROM subject WHERE subject_id=?';
    con.query(delSql, [subjectId], (err, result) => {
        if (err) {
            console.error("Error deleting subject:", err);
            return res.status(500).json({ message: "Failed to delete subject" });
        }
        console.log("Subject deleted successfully");
        return res.status(200).json({ message: "Subject deleted successfully" });
    });
});

// Endpoint to update a subject by subject_id
app.put('/editsubject/:subjectId', (req, res) => {
    const subjectId = req.params.subjectId;
    const { subject_name } = req.body;

    if (!subject_name) {
        return res.status(400).json({ message: "Subject name is required" });
    }

    const updateSql = "UPDATE subject SET subject_name=? WHERE subject_id=?";
    con.query(updateSql, [subject_name, subjectId], (err, result) => {
        if (err) {
            console.error("Error updating subject:", err);
            return res.status(500).json({ message: "Failed to update subject" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Subject not found for update" });
        }
        console.log("Subject updated successfully");
        return res.status(200).json({ message: "Subject updated successfully" });
    });
});



// QUESTIONS LOGIC
/*app.post("/add-question", (req, res) => {
    const {
        subject,
        ques_text,
        ques_text_image_data,
        Qa_text,
        Qa_image_data,
        Qb_text,
        Qb_image_data,
        Qc_text,
        Qc_image_data,
        Qd_text,
        Qd_image_data,
        Cans
    } = req.body;

    const query = `
        INSERT INTO questions (
            subject_id, ques_text, ques_text_image_data,
            Qa_text, Qa_image_data,
            Qb_text, Qb_image_data,
            Qc_text, Qc_image_data,
            Qd_text, Qd_image_data,
            Cans
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        subject,
        ques_text,
        ques_text_image_data || null,
        Qa_text,
        Qa_image_data || null,
        Qb_text,
        Qb_image_data || null,
        Qc_text,
        Qc_image_data || null,
        Qd_text,
        Qd_image_data || null,
        Cans
    ];

    con.query(query, values, (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            res.status(500).send("Error inserting data");
        } else {
            res.status(200).send("Question added successfully");
        }
    });
});
*/

const multiUpload = upload.fields([
    { name: 'ques_text_image', maxCount: 1 },
    { name: 'Qa_image', maxCount: 1 },
    { name: 'Qb_image', maxCount: 1 },
    { name: 'Qc_image', maxCount: 1 },
    { name: 'Qd_image', maxCount: 1 }
]);

app.post('/add-question', multiUpload, (req, res) => {
    const {
        subject,
        ques_text,
        Qa_text,
        Qb_text,
        Qc_text,
        Qd_text,
        Cans
    } = req.body;

    const ques_text_image_data = req.files['ques_text_image'] ? req.files['ques_text_image'][0].filename : null;
    const Qa_image_data = req.files['Qa_image'] ? req.files['Qa_image'][0].filename : null;
    const Qb_image_data = req.files['Qb_image'] ? req.files['Qb_image'][0].filename : null;
    const Qc_image_data = req.files['Qc_image'] ? req.files['Qc_image'][0].filename : null;
    const Qd_image_data = req.files['Qd_image'] ? req.files['Qd_image'][0].filename : null;

    console.log('ques_text_image_data:', ques_text_image_data);
    console.log('Qa_image_data:', Qa_image_data);
    console.log('Qb_image_data:', Qb_image_data);
    console.log('Qc_image_data:', Qc_image_data);
    console.log('Qd_image_data:', Qd_image_data);

    const query = `
        INSERT INTO questions (
            subject_id, ques_text, ques_text_image_data,
            Qa_text, Qa_image_data,
            Qb_text, Qb_image_data,
            Qc_text, Qc_image_data,
            Qd_text, Qd_image_data,
            Cans
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        subject || null,
        ques_text || null,
        ques_text_image_data,
        Qa_text || null,
        Qa_image_data,
        Qb_text || null,
        Qb_image_data,
        Qc_text || null,
        Qc_image_data,
        Qd_text || null,
        Qd_image_data,
        Cans || null
    ];

    con.query(query, values, (err, result) => {
        if (err) {
            console.error("Error adding question:", err);
            return res.status(500).json({ message: "Failed to add question" });
        }
        console.log("Question added successfully");
        return res.status(200).json({ message: "Question added successfully", questionId: result.insertId });
    });
});


app.get('/getquestion', (req, res) => {
    const query = `
        SELECT 
            question_id,
            subject_id,
            ques_text,
            ques_text_image_data,
            Qa_text,
            Qa_image_data,
            Qb_text,
            Qb_image_data,
            Qc_text,
            Qc_image_data,
            Qd_text,
            Qd_image_data,
            Cans
        FROM questions
    `;
    
    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).json({ message: 'Failed to fetch questions' });
        }
        console.log('Questions fetched successfully');
        return res.status(200).json(results);
    });
});
app.get('/getquestions', (req, res) => {
    const { subjectId } = req.query;

    if (!subjectId) {
        return res.status(400).json({ error: "Subject ID is required" });
    }

    const query = 'SELECT * FROM questions WHERE subject_id = ?';
    con.query(query, [subjectId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch questions" });
        }

        res.json(results);
    });
});


const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

//saving result
app.post('/saveExamResults', (req, res) => {
    const {
        studentName,
        mobilenumber,
        studentId,
        subjectName,
        
        attemptedCount,
        unattemptedCount,
        correctAnswersCount,
        wrongAnswersCount,
        totalMarks,
        startTime,
        endTime
    } = req.body;

    
    console.log('Parsed Correct Answers Count:',correctAnswersCount);
    console.log('Parsed Wrong Answers Count:', wrongAnswersCount);
    console.log('Parsed Total Marks:', totalMarks);
    const formattedStartTime = formatDate(startTime);
    const formattedEndTime = formatDate(endTime);


    const query = `
        INSERT INTO exam_results (
            studentName,
            studentMobileNo,
            studentId,
            subject,
            Attempted,
            UnAttempted,
            CorrectAnswered,
            WrongAnswered,
            TotalMarks,
            Examstarttime,
            Examendtime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        studentName,
        mobilenumber,
        studentId,
        subjectName,
        attemptedCount,
        unattemptedCount,
        correctAnswersCount,
        wrongAnswersCount,
        totalMarks,
        formattedStartTime,
        formattedEndTime
    ];
    console.log('Query:', query);
    console.log('Values:', values);

    con.query(query, values, (error, results) => {
        if (error) {
            console.error('Error saving exam results:', error);
            return res.status(500).json({ error: 'Error saving exam results' });
        }
        res.status(200).json({ message: 'Exam results saved successfully' });
    });
});
// Endpoint to fetch exam results
app.get('/examresults', (req, res) => {
    const sql = "SELECT * FROM exam_results";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching exam results", err);
            return res.status(500).json({ message: "Failed to fetch exam results" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "No exam results found" });
        }
        console.log("Successfully fetched exam results");
        return res.status(200).json(result);
    });
});

// TAsk
app.get('/getquestionc', (req, res) => {
    const subjectId = req.query.subject_id;
    const query = 'SELECT * FROM questions WHERE subject_id = ?';

    con.query(query, [subjectId], (error, results) => {
        if (error) {
            return res.status(500).send('Error fetching questions');
        }
        res.json(results);
    });
});

app.post('/assignTask', (req, res) => {
    const { student_id, subject_id, question_count,dsquestion_count, starttime, endtime } = req.body;

    const sqlInsert = "INSERT INTO Atask (student_id, subject_id, question_count,dsquestion_count, exam_start_time, exam_end_time) VALUES (?, ?, ?, ?, ?,?)";
    con.query(sqlInsert, [student_id, subject_id, question_count,dsquestion_count, starttime, endtime], (err, result) => {
        if (err) {
            console.error("Error fetching exam results", err);
            return res.status(500).json({ message: "Failed to assigned task" });
        }
        
        console.log("Successfully fetched assigned task");
        return res.status(200).json(result);
    });
    
});

app.get('/getAssignedTasks', (req, res) => {
    const student_id = req.query.student_id;

    const sqlSelect = "SELECT * FROM Atask WHERE student_id = ?";
    con.query(sqlSelect, [student_id], (err, result) => {
        if (err) {
            console.error("Error  exam assigned task results", err);
            return res.status(500).json({ message: "Failed to fetch task results" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "No assigned task  found" });
        }
        console.log("Successfully fetched assigned task");
        return res.status(200).json(result);
    });
});
app.get('/studentdetail', (req, res) => {
    const student_id = req.query.student_id;

    const sqlSelect = "SELECT * FROM student1 WHERE student_id = ?";
    con.query(sqlSelect, [student_id], (err, result) => {
        if (err) {
            console.error("Error  exam assigned task results", err);
            return res.status(500).json({ message: "Failed to fetch task results" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "No assigned task  found" });
        }
        console.log("Successfully fetched assigned task");
        return res.status(200).json(result);
    });
});
app.get('/getSubjectName', (req, res) => {
    const subjectId = req.query.subject_id;
    const sql = `SELECT subject_name FROM subject WHERE subject_id = ?`;
    con.query(sql, [subjectId], (err, result) => {
        if (err) {
            res.send({ error: err });
        } else {
            res.send(result);
        }
    });
});

app.post('/dsquestions',(req,res)=>{
    const{subject_id,questiontext}=req.body;
    const sql="insert into dsquestion(dsquestion,subject_id) values(?,?)";
    con.query(sql,[questiontext,subject_id],(err,result)=>{
        if(err){
            console.error("Error storeing dsquestion",err);
            return res.status(500).json({message:"failed toadding the ds question"})

        }else{
            console.log("sucessfully added data in ds")
            return res.status(200).json(result)
        }
    })
})
app.get("/subjectquestions/:subjectId", (req, res) => {
    const subjectId = req.params.subjectId;
    const sql = `SELECT * FROM questions WHERE subject_id = ?`;
    con.query(sql, [subjectId], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});
app.put('/editquestion/:id', upload.fields([
    { name: 'ques_text_image', maxCount: 1 },
    { name: 'Qa_image', maxCount: 1 },
    { name: 'Qb_image', maxCount: 1 },
    { name: 'Qc_image', maxCount: 1 },
    { name: 'Qd_image', maxCount: 1 },
]), (req, res) => {
    const { id } = req.params;
    const {
        ques_text,
        Qa_text,
        Qb_text,
        Qc_text,
        Qd_text,
        Cans
    } = req.body;

    let ques_text_image = null;
    let Qa_image = null;
    let Qb_image = null;
    let Qc_image = null;
    let Qd_image = null;

    if (req.files) {
        if (req.files['ques_text_image']) {
            ques_text_image = req.files['ques_text_image'][0].filename;
        }
        if (req.files['Qa_image']) {
            Qa_image = req.files['Qa_image'][0].filename;
        }
        if (req.files['Qb_image']) {
            Qb_image = req.files['Qb_image'][0].filename;
        }
        if (req.files['Qc_image']) {
            Qc_image = req.files['Qc_image'][0].filename;
        }
        if (req.files['Qd_image']) {
            Qd_image = req.files['Qd_image'][0].filename;
        }
    }

    const query = `
        UPDATE questions 
        SET ques_text = ?, 
            Qa_text = ?, 
            Qb_text = ?, 
            Qc_text = ?, 
            Qd_text = ?, 
            Cans = ?, 
            ques_text_image_data = COALESCE(?, ques_text_image_data), 
            Qa_image_data = COALESCE(?, Qa_image_data), 
            Qb_image_data = COALESCE(?, Qb_image_data), 
            Qc_image_data = COALESCE(?, Qc_image_data), 
            Qd_image_data = COALESCE(?, Qd_image_data)
        WHERE question_id = ?`;

    const values = [
        ques_text,
        Qa_text,
        Qb_text,
        Qc_text,
        Qd_text,
        Cans,
        ques_text_image,
        Qa_image,
        Qb_image,
        Qc_image,
        Qd_image,
        id
    ];

    con.query(query, values, (error, results) => {
        if (error) {
            console.error("Error updating question:", error);
            return res.status(500).json({ error: "Error updating question" });
        }
        res.json({ message: "Question updated successfully" });
    });
});

app.delete(`/deletequestion/:questionId`,(req,res)=>{
    const questionid=req.params.questionId;
    const query="delete from questions where question_id=?"
    con.query(query,[questionid] ,(err,result)=>{
        if(err){
            console.error("error occured while deleteing",err)
            return res.status(500).json({err:"error deleteing question"});
        }
        console.log("quesion deleted sucessfully")
        res.status(200).json(result)

    })
   
})

app.get(`/theoryquestions/:subjectid`,(req,res)=>{
    const subject_id=req.params.subjectid;
    const sql="select * from dsquestion where subject_id=?";
    con.query(sql,[subject_id],(err,result)=>{
        if(err){
            console.error("fetching theroy questions error",err);
            return res.status(500).json({err:"error fetcheing theory questions"})
        }
        console.log("sucessfully fetched theory questions")
        res.status(200).json(result);
    })
})

// Define the file upload middleware
const multiUploads = upload.fields([
    { name: 'ques_text_image', maxCount: 1 },
    { name: 'Qa_image', maxCount: 1 },
    { name: 'Qb_image', maxCount: 1 },
    { name: 'Qc_image', maxCount: 1 },
    { name: 'Qd_image', maxCount: 1 }
]);

app.post('/addquestion', multiUploads, (req, res) => {
    // Extract form fields and file information
    const {
        subject,
        ques_text,
        Qa_text,
        Qb_text,
        Qc_text,
        Qd_text,
        Cans
    } = req.body;

    // Extract filenames for uploaded files
    const ques_text_image_data = req.files['ques_text_image'] ? req.files['ques_text_image'][0].filename : null;
    const Qa_image_data = req.files['Qa_image'] ? req.files['Qa_image'][0].filename : null;
    const Qb_image_data = req.files['Qb_image'] ? req.files['Qb_image'][0].filename : null;
    const Qc_image_data = req.files['Qc_image'] ? req.files['Qc_image'][0].filename : null;
    const Qd_image_data = req.files['Qd_image'] ? req.files['Qd_image'][0].filename : null;

    // Log file information for debugging
    console.log('ques_text_image_data:', ques_text_image_data);
    console.log('Qa_image_data:', Qa_image_data);
    console.log('Qb_image_data:', Qb_image_data);
    console.log('Qc_image_data:', Qc_image_data);
    console.log('Qd_image_data:', Qd_image_data);

    // Prepare SQL query
    const query = `
        INSERT INTO questions (
            subject_id, ques_text, ques_text_image_data,
            Qa_text, Qa_image_data,
            Qb_text, Qb_image_data,
            Qc_text, Qc_image_data,
            Qd_text, Qd_image_data,
            Cans
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        subject || null,
        ques_text || null,
        ques_text_image_data,
        Qa_text || null,
        Qa_image_data,
        Qb_text || null,
        Qb_image_data,
        Qc_text || null,
        Qc_image_data,
        Qd_text || null,
        Qd_image_data,
        Cans || null
    ];

    // Execute SQL query
    con.query(query, values, (err, result) => {
        if (err) {
            console.error("Error adding question:", err);
            return res.status(500).json({ message: "Failed to add question" });
        }
        console.log("Question added successfully");
        return res.status(200).json({ message: "Question added successfully", questionId: result.insertId });
    });
});

app.put('/editdsques/:editdsquesId', (req, res) => {
    const editeddsquesid = req.params.editdsquesId;
    const { dsquestion } = req.body; // Extract dsquestion from request body
    const query = "UPDATE dsquestion SET dsquestion=? WHERE dsq_id=?";
    con.query(query, [dsquestion, editeddsquesid], (err, result) => {
        if (err) {
            console.log("Error updating the descriptive question:", err);
            return res.status(500).json({ message: "Failed to update the descriptive question" });
        }
        console.log("Descriptive question updated successfully");
        return res.status(200).json(result);
    });
});

app.delete('/deletedsquestion/:questionId', (req, res) => {
    const deletedsquestion = req.params.questionId;
    const sqlquery = "DELETE FROM dsquestion WHERE dsq_id = ?";
    
    con.query(sqlquery, [deletedsquestion], (err, result) => {
        if (err) {
            console.error("Error deleting descriptive question:", err);
            return res.status(500).json({ message: "Error deleting the descriptive question" });
        }

        console.log("Successfully deleted the descriptive question");
        return res.status(200).json({ message: "Descriptive question deleted successfully" });
    });
});

app.post('/randomassignTask',(req,res)=>{
    const{subject_id,Examname,question_count,dsquestion_count,
        starttime,endtime,pmulquestion_count,
        pdsquestion_count,
        pmulquestion_id,
        pdsquestion_id

    }=req.body;

    const sql=`insert into Atask1(exa_name,subject_id,question_count,dsquestion_count,
    exam_start_time,exam_end_time,pmulquestion_count,pdsquestion_count,
    pmulquestion_id,pdsquestion_id) values(?,?,?,?,?,?,?,?,?,?)`;

    const values=[Examname,subject_id,question_count,dsquestion_count,starttime,endtime,pmulquestion_count,pdsquestion_count,
        pmulquestion_id,
        pdsquestion_id]
    
    con.query(sql,values,(err,result)=>{
        if(err){
            console.error("error occured while storeing the task details",err)
            return res.status(500).json({message:"error storeing the task details"})
        }
        else{
            console.log("sucess assign the taskdetails")
            return res.status(200).json(result)
        }
    })

})

app.post('/assignTasks', (req, res) => {
    const {
        subject_id,
        Examname,
        question_count,
        dsquestion_count,
        exam_start_time,
        exam_end_time,
        pmulquestion_count,
        pdsquestion_count,
        pmulquestion_id,
        pdsquestion_id
    } = req.body;

    // Prepare SQL query
    const sql = `
        INSERT INTO Atask1(
            subject_id, 
            exa_name, 
            question_count, 
            dsquestion_count, 
            exam_start_time, 
            exam_end_time, 
            pmulquestion_count, 
            pdsquestion_count, 
            pmulquestion_id, 
            pdsquestion_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        subject_id,
        Examname,
        question_count,
        dsquestion_count,
        exam_start_time,
        exam_end_time,
        pmulquestion_count,
        pdsquestion_count,
        pmulquestion_id,  // Comma-separated values
        pdsquestion_id    // Comma-separated values
    ];

    // Execute SQL query
    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting task', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json({ message: 'Task assigned successfully', data: result });
    });
});

app.get('/getSpecificQuestions', (req, res) => {
    const { ids } = req.query;

    if (!ids) {
        return res.status(400).json({ error: "IDs are required" });
    }

    // Split the IDs into an array and escape single quotes for SQL injection prevention
    const idsArray = ids.split(',').map(id => `'${id.trim()}'`).join(',');

    // Construct the SQL query with placeholders for the IDs
    const sql = `SELECT * FROM questions WHERE question_id IN (${idsArray})`;

    // Execute the query
    con.query(sql, (err, results) => {
        if (err) {
            console.error("Fetching specific questions error:", err);
            return res.status(500).json({ error: "Failed to fetch specific questions" });
        }

        console.log("Successfully fetched specific questions");
        res.status(200).json(results);
    });
});

app.get('/getSpecificDescriptiveQuestions', (req, res) => {
    const { ids } = req.query;

    if (!ids) {
        return res.status(400).json({ error: "IDs are required" });
    }

    // Split the IDs into an array and escape single quotes for SQL injection prevention
    const idsArray = ids.split(',').map(id => `'${id.trim()}'`).join(',');

    // Construct the SQL query with placeholders for the IDs
    const sql = `SELECT * FROM dsquestion WHERE dsq_id IN (${idsArray})`;

    // Execute the query
    con.query(sql, (err, results) => {
        if (err) {
            console.error("Fetching specific questions error:", err);
            return res.status(500).json({ error: "Failed to fetch specific questions" });
        }

        console.log("Successfully fetched specific questions");
        res.status(200).json(results);
    });
});

app.get('/getexamdetails',(req,res)=>{

    const sql="select * from Atask1";

    con.query(sql,(err,result)=>{
        if(err){
            console.error("error geting taskdetails",err)
            return res.status(500).json({messsge:"error geting task details"})
        }
        console.log("sucessfully getting task details")
        return res.status(200).json(result)
    })
})
// Routes
app.post('/assignExam', (req, res) => {
    const assignments = req.body;

    if (!Array.isArray(assignments) || assignments.length === 0) {
        return res.status(400).json({ error: 'Invalid data.' });
    }

    // Begin transaction
    con.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ error: 'Transaction error' });
        }

        // Insert data into `exam` table
        const sql = 'INSERT INTO exam (student_id, task_id) VALUES ?';
        const values = assignments.map(item => [item.student_id, item.task_id]);

        con.query(sql, [values], (error, results) => {
            if (error) {
                return db.rollback(() => {
                    console.error('Error inserting data:', error);
                    res.status(500).json({ error: 'Failed to assign exams.' });
                });
            }

            // Commit transaction
            con.commit(err => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Transaction commit error:', err);
                        res.status(500).json({ error: 'Failed to assign exams.' });
                    });
                }

                res.status(200).json({ message: 'Exams assigned successfully.' });
            });
        });
    });
});
app.get('/getDetailedTasks1', (req, res) => {
    const studentId = req.query.student_id;
  
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
  
    const query = `
      SELECT 
        e.task_id,
        a.exa_name,
        a.subject_id,
        a.question_count,
        a.exam_start_time,
        a.exam_end_time,
        a.dsquestion_count,
        a.pmulquestion_count,
        a.pdsquestion_count,
        a.pmulquestion_id,
        a.pdsquestion_id
      FROM exam e
      JOIN Atask1 a ON e.task_id = a.task_id
      WHERE e.student_id = ?
    `;
  
    con.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });
  app.get(`/particulargetDetailedTasks1/:student_id`, (req, res) => {
    const studentId = req.params.student_id;
  
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
  
    const query = `
      SELECT 
        e.task_id,
        a.exa_name,
        a.subject_id,
        a.question_count,
        a.exam_start_time,
        a.exam_end_time,
        a.dsquestion_count,
        a.pmulquestion_count,
        a.pdsquestion_count,
        a.pmulquestion_id,
        a.pdsquestion_id
      FROM exam e
      JOIN Atask1 a ON e.task_id = a.task_id
      WHERE e.student_id = ?
    `;
  
    con.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });

  app.get(`/particularresult/:studentid`,(req,res)=>{
    const student_id=req.params.studentid;
    const sql ="select * from exam_results where studentId=?";
    con.query(sql,[student_id],(err,result)=>{
        if(err){
            console.error("error occured while fetching the results",err)
            return res.status(500).json({message:"error occured while getting particular student results"})
        }
        else{
            console.log("sucessfully getting particular student results")
            return res.status(200).json(result)
        }

    })
  })

  app.get('/getcompletetaskdetails', (req, res) => {
    
    const query = `
      SELECT 
        
             student1.student_id,student1.student_name,Atask1.task_id,exam.exam_id,
             Atask1.exa_name,Atask1.question_count,Atask1.dsquestion_count,Atask1.dsquestion_count,Atask1.pmulquestion_count,Atask1.pdsquestion_count,Atask1.pmulquestion_id,Atask1.pdsquestion_id, Atask1.subject_id, Atask1.exam_start_time, Atask1.exam_end_time
      FROM exam
      JOIN student1 ON exam.student_id = student1.student_id
      JOIN Atask1 ON exam.task_id = Atask1.task_id
    `;
  
  
    con.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching detailed tasks:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });

// Route to update a task
const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
// Route to update a task
app.put('/updateTask', (req, res) => {
    const { task_id, exam_name, exam_start_time, exam_end_time } = req.body;

    const formattedStartTime = formatDateTime(exam_start_time);
    const formattedEndTime = formatDateTime(exam_end_time);

    const query = `
        UPDATE Atask1
        SET exa_name = ?, exam_start_time = ?, exam_end_time = ?
        WHERE task_id = ?
    `;

    con.query(query, [exam_name, formattedStartTime, formattedEndTime, task_id], (error, results) => {
        if (error) {
            console.error('Error updating task:', error);
            return res.status(500).send('Error updating task');
        }
        res.send('Task updated successfully');
    });
});
// Route to delete a task
app.delete('/deleteTask', (req, res) => {
    const taskId = req.query.task_id;

    const query = 'DELETE FROM Atask1 WHERE task_id = ?';
    con.query(query, [taskId], (error, results) => {
        if (error) {
            console.error('Error deleting task:', error);
             return res.status(500).json({message:"error occured while deleting the taskdetails"})
        }
        res.json(results);
    });
});

/*
app.post('/assignstudents', (req, res) => {
    const { evaluator_id, student_ids } = req.body;

    if (!evaluator_id || !student_ids || !Array.isArray(student_ids)) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    // Prepare SQL query
    const query = 'INSERT INTO evalassignstud (evaluator_id, student_id) VALUES ?';
    const values = student_ids.map(student_id => [evaluator_id, student_id]);

    con.query(query, [values], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json({ message: 'Students assigned successfully' });
    });
});

*/

app.post('/assignstudents', (req, res) => {
    const { evaluator_id, student_ids } = req.body;

    /*if (!evaluator_id || !student_ids || !Array.isArray(student_ids)) {
        return res.status(400).json({ message: 'Invalid input' });
    }
        */

      // Check if all required conditions are met
      if (!(evaluator_id && student_ids && Array.isArray(student_ids))) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    // Begin transaction
    con.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ message: 'Transaction error', error: err });
        }

        // Prepare SQL query
        const query = 'INSERT INTO evalassignstud (evaluator_id, student_id) VALUES ?';
        const values = student_ids.map(student_Id => [evaluator_id, student_Id]);

        // Execute query
        con.query(query, [values], (error, results) => {
            if (error) {
                // Rollback transaction on error
                return connection.rollback(() => {
                    console.error('Error inserting data:', error);
                    res.status(500).json({ message: 'Database error', error: error });
                });
            }

            // Commit transaction
            con.commit(err => {
                if (err) {
                    // Rollback transaction on commit error
                    return connection.rollback(() => {
                        console.error('Transaction commit error:', err);
                        res.status(500).json({ message: 'Failed to assign students', error: err });
                    });
                }

                res.status(200).json({ message: 'Students assigned successfully' });
            });
        });
    });
});

app.get('/assignstudentdetails', (req, res) => {
    const sql = `
        SELECT 
            student1.student_id, 
            student1.student_name, 
            evaluator.evaluator_id, 
            evaluator.evaluator_name,
            evalassignstud.assignstude_id 
        FROM evalassignstud
        JOIN student1 ON evalassignstud.student_id = student1.student_id
        JOIN evaluator ON evalassignstud.evaluator_id = evaluator.evaluator_id
    `;
    
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching detailed student assignments:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

app.delete('/deleteassignstudent/:assignstudentid',(req,res)=>{
    const assignstudentId=req.params.assignstudentid;
    const sql="delete from evalassignstud where assignstude_id=?";
    con.query(sql,[assignstudentId],(err,results)=>{
        if(err){
            console.error("delete the record error occured",err)
            return res.status(500).json({message:"assigning the student error occured"});
        }
        return res.status(200).json(results)
    })
})

app.get('/questions', (req, res) => {
    con.query('SELECT * FROM dsquestion', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});




// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));
const PORT = 3004;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
