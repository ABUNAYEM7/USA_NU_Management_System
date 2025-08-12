const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
// const dayjs = require("dayjs");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const sendScheduleEmail = require("./utils/sendScheduleEmail");
const bucket = require("./Firebase/firebaseAdmin");

// middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://populi.usanu.us"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/files", express.static("files"));

// verifyToken   middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // console.log("JWT verify failed:", err);
      return res.status(403).send({ message: "Forbidden" });
    }
    req.user = decoded;
    next();
  });
};

// verify admin middleware
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send({ message: "Admin only access." });
  }
  next();
};

// This runs every day at 7:00 AM
cron.schedule("0 7 * * *", () => {
  console.log("⏰ Sending class schedule emails...");
});

// mongodb url
const uri = `mongodb+srv://${process.env.VITE_USER}:${process.env.VITE_PASS}@cluster404.3am084m.mongodb.net/academi_core?retryWrites=true&w=majority&appName=Cluster404`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// socket io server
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend origin here for safety in production
    methods: ["GET", "POST"],
  },
});

// Socket.IO event listeners
io.on("connection", (socket) => {
  if (process.env.NODE_ENV === "development") {
    console.log("✅ A user connected:", socket.id);
  }

  // Join role-based room (emitted from frontend)
  socket.on("join-role", (role, email) => {
    const room = `${role}-room`;

    socket.join(room);

    if (process.env.NODE_ENV === "development") {
      console.log(`🔐 Socket ${socket.id} joined room: ${room}`);
    }

    // Optionally, join email-based private room (for direct notifications)
    if (email) {
      socket.join(email);
      if (process.env.NODE_ENV === "development") {
        console.log(
          `📩 Socket ${socket.id} also joined personal room: ${email}`
        );
      }
    }
  });

  socket.on("disconnect", () => {
    if (process.env.NODE_ENV === "development") {
      console.log("❌ User disconnected:", socket.id);
    }
  });

  // Example chat event still optional
  socket.on("chat-message", (msg) => {
    if (process.env.NODE_ENV === "development") {
      console.log("💬 Message received:", msg);
    }
    io.emit("chat-message", msg); // Broadcast to all
  });
});

// mongodb function
async function run() {
  try {
    // await client.connect();

    // collections
    const usersCollection = client.db("academi_core").collection("users");
    const facultiesCollection = client
      .db("academi_core")
      .collection("faculties");
    const courseCollection = client.db("academi_core").collection("courses");
    const materialsCollection = client
      .db("academi_core")
      .collection("materials");
    const assignmentsCollection = client
      .db("academi_core")
      .collection("assignments");

    const subAssignmentsCollection = client
      .db("academi_core")
      .collection("subAssignment");

    const attendanceCollection = client
      .db("academi_core")
      .collection("attendance");

    const courseDistributionCollection = client
      .db("academi_core")
      .collection("course_distribution");

    const studentsCollection = client.db("academi_core").collection("students");

    const gradesCollection = client.db("academi_core").collection("grades");

    const leavesCollection = client.db("academi_core").collection("leaves");

    const routinesCollection = client.db("academi_core").collection("routine");
    const messageCollection = client.db("academi_core").collection("message");
    const notificationCollection = client
      .db("academi_core")
      .collection("notification");
    const paymentsCollection = client.db("academi_core").collection("payments");
    const enrollmentRequestsCollection = client
      .db("academi_core")
      .collection("enrollmentRequests");

    // save new user data in db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // save new faculty secured
    app.post("/add-faculty", verifyToken, verifyAdmin, async (req, res) => {
      const info = req.body;

      try {
        const user = await usersCollection.findOne({ email: info.email });

        if (user) {
          // Update role to 'faculty' if user exists
          await usersCollection.updateOne(
            { email: info.email },
            { $set: { role: "faculty" } }
          );
        } else {
          // Create new user with role 'faculty' if user doesn't exist
          await usersCollection.insertOne({
            name: `${info.firstName} ${info.lastName}`,
            photo: info.staffPhoto,
            email: info.email,
            role: "faculty",
          });
        }

        // Create faculty in the facultiesCollection regardless
        const result = await facultiesCollection.insertOne(info);

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to add faculty" });
      }
    });

    // update specific course secured
    app.patch(
      "/update-course/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const data = req.body;
        const updatedCourse = {
          $set: {
            courseId: data.courseId,
            name: data.name,
            credit: data.credit,
            description: data.description,
            facultyEmail: data.facultyEmail,
            date: data.date,
          },
        };
        const result = await courseCollection.updateOne(filter, updatedCourse);
        res.send(result);
      }
    );

    // POST: Mark attendance secured
    app.post("/mark-attendance", verifyToken, async (req, res) => {
      const { courseId, date, students, takenBy } = req.body;

      const course = await courseCollection.findOne({
        _id: new ObjectId(courseId),
      });
      if (!course) {
        return res.status(404).send({ message: "Course not found" });
      }

      // ✅ Allow only the assigned faculty (NOT admin)
      const isAssignedFaculty = course.facultyEmail === req.user.email;
      if (!isAssignedFaculty) {
        return res.status(403).send({
          message: "Forbidden: Only assigned faculty can mark attendance",
        });
      }

      const alreadyTaken = await attendanceCollection.findOne({
        courseId,
        date,
      });
      if (alreadyTaken) {
        return res
          .status(409)
          .send({ message: "Attendance already taken for this date." });
      }

      const result = await attendanceCollection.insertOne({
        courseId,
        date,
        students,
        takenBy,
        createdAt: new Date().toISOString(),
      });

      res.send(result);
    });

    // create new students from user secured
    app.post("/create-student", verifyToken, verifyAdmin, async (req, res) => {
      const {
        email,
        name,
        photo,
        studentId,
        department,
        city,
        country,
        currentAddress,
        permanentAddress,
        gender,
      } = req.body;

      if (!email || !name) {
        return res.status(400).send({ message: "Missing required fields" });
      }

      const existingStudent = await studentsCollection.findOne({ email });

      if (existingStudent) {
        return res.status(409).send({ message: "Student already exists" });
      }

      const newStudent = {
        email,
        name,
        photo,
        studentId,
        department,
        city,
        country,
        currentAddress,
        permanentAddress,
        gender,
        createdAt: new Date(),
      };

      const result = await studentsCollection.insertOne(newStudent);
      res.send({ success: true, insertedId: result.insertedId });
    });

    // post weekly routine secured
    app.post(
      "/add/weekly-routine",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const data = req.body;

          // Validate required fields
          if (
            !data.semester ||
            !data.department ||
            !Array.isArray(data.routines)
          ) {
            return res
              .status(400)
              .send({ message: "Missing required fields." });
          }

          const allHaveCourse = data.routines.every((r) => r.course);
          if (!allHaveCourse) {
            return res
              .status(400)
              .send({ message: "Each routine must include a course." });
          }

          const result = await routinesCollection.insertOne({
            semester: data.semester,
            department: data.department,
            weekStartDate: data.weekStartDate,
            routines: data.routines,
            createdBy: data.createdBy,
            createdAt: new Date(),
          });

          res.send({ success: true, insertedId: result.insertedId });
        } catch (err) {
          console.error("❌ Error storing weekly routine:", err);
          res.status(500).send({ message: "Internal server error" });
        }
      }
    );


    // update user role secured
    app.patch(
      "/update/user-role/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateFields = req.body;

        if (process.env.NODE_ENV === "development") {
          console.log("🔧 Patch update for user:", updateFields);
        }

        const updateQuery = {
          $set: { ...updateFields },
        };

        const result = await usersCollection.updateOne(filter, updateQuery);
        res.send(result);
      }
    );

    // // update user information secured old
    // app.patch("/update/user-info/:email", verifyToken, async (req, res) => {
    //   const email = req.params.email;
    //   const filter = { email };
    //   const data = req.body;
    //   const updatedInfo = {
    //     $set: { ...data },
    //   };
    //   const result = await usersCollection.updateOne(filter, updatedInfo);
    //   res.send(result);
    // });

    // // update user information secured old new
    app.patch("/update/user-info/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const data = req.body;

      try {
        // Step 1: Find user to determine role
        const user = await usersCollection.findOne({ email });

        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        // Step 2: Prepare the update object
        const updatedInfo = {
          $set: { ...data },
        };

        // Step 3: Update in usersCollection
        const userUpdateResult = await usersCollection.updateOne(
          filter,
          updatedInfo
        );

        // Step 4: If user is student, also update in studentsCollection
        let secondaryUpdateResult = null;

        if (user.role === "student") {
          secondaryUpdateResult = await studentsCollection.updateOne(
            filter,
            updatedInfo
          );
        } else if (user.role === "faculty") {
          secondaryUpdateResult = await facultiesCollection.updateOne(
            filter,
            updatedInfo
          );
        }
        res.send({
          success: true,
          userUpdate: userUpdateResult.modifiedCount,
          secondaryUpdate: secondaryUpdateResult?.modifiedCount || 0,
        });
      } catch (error) {
        console.error("❌ Failed to update user info:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // ✅ PATCH: Update leave status (approve/decline) secured
    app.patch("/update-leave-status/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "declined"].includes(status)) {
        return res.status(400).send({ message: "Invalid status value" });
      }

      try {
        const leave = await leavesCollection.findOne({ _id: new ObjectId(id) });
        if (!leave) {
          return res.status(404).send({ message: "Leave not found" });
        }

        const student = await studentsCollection.findOne({
          email: leave.email,
        });
        if (!student || !student.courses) {
          return res
            .status(404)
            .send({ message: "Student or courses not found" });
        }

        const facultyEmail = req.user.email;
        const facultyCourses = await courseCollection
          .find({
            _id: { $in: student.courses.map((c) => new ObjectId(c.courseId)) },
            facultyEmail,
          })
          .toArray();

        if (facultyCourses.length === 0) {
          return res.status(403).send({
            message: "Forbidden: You are not assigned to this student's course",
          });
        }

        const result = await leavesCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status,
              updatedAt: new Date(),
            },
          }
        );

        if (result.modifiedCount > 0) {
          res.send({ success: true, modifiedCount: result.modifiedCount });
        } else {
          res.status(404).send({
            success: false,
            message: "Leave not found or already updated",
          });
        }
      } catch (err) {
        console.error("Error updating leave status:", err);
        res.status(500).send({ message: "Failed to update leave status" });
      }
    });

    // PATCH: Update a single day in the weekly routine secured
    app.patch(
      "/update-routine-day/:routineId/:dayIndex",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const { routineId, dayIndex } = req.params;
        const updatedDay = req.body;

        if (!ObjectId.isValid(routineId)) {
          return res.status(400).send({ message: "Invalid routine ID" });
        }

        try {
          const routine = await routinesCollection.findOne({
            _id: new ObjectId(routineId),
          });

          if (!routine) {
            return res.status(404).send({ message: "Routine not found" });
          }

          // Ensure dayIndex is valid
          const index = parseInt(dayIndex, 10);
          if (isNaN(index) || index < 0 || index >= routine.routines.length) {
            return res.status(400).send({ message: "Invalid day index" });
          }

          // Update specific day's routine
          const updateQuery = {
            $set: {
              [`routines.${index}`]: updatedDay,
              updatedAt: new Date(),
            },
          };

          const result = await routinesCollection.updateOne(
            { _id: new ObjectId(routineId) },
            updateQuery
          );

          res.send({ success: true, modifiedCount: result.modifiedCount });
        } catch (error) {
          console.error("Error updating routine day:", error);
          res.status(500).send({ message: "Internal server error" });
        }
      }
    );

    // PATCH: Update routine day status
    app.patch(
      "/update-routine-day-status/:routineId/:dayIndex",
      verifyToken,
      async (req, res) => {
        const { routineId, dayIndex } = req.params;
        const { status } = req.body;

        if (
          !["pending", "completed", "in-progress", "canceled"].includes(status)
        ) {
          return res.status(400).send({ message: "Invalid status" });
        }

        try {
          const index = parseInt(dayIndex);
          const result = await routinesCollection.updateOne(
            { _id: new ObjectId(routineId) },
            {
              $set: {
                [`routines.${index}.status`]: status, // fixed small mistake here
              },
            }
          );

          res.send({ success: true, modifiedCount: result.modifiedCount });
        } catch (error) {
          console.error("Error updating status:", error);
          res.status(500).send({ message: "Failed to update status" });
        }
      }
    );

    //✅✅✅✅ payment update fee amount patch route

    // upload manuall payment history
    app.post("/manual-payment-entry", async (req, res) => {
      try {
        const { studentId, email, name, subject, amount, status, recordedBy } =
          req.body;

        // Validate required fields
        if (
          !studentId ||
          !email ||
          !name ||
          !subject ||
          !amount ||
          !status ||
          !recordedBy
        ) {
          return res.status(400).send({ error: "All fields are required." });
        }

        // Prepare the payment document
        const paymentData = {
          userName: name,
          userEmail: email,
          studentId,
          subject,
          amount,
          status,
          type: "manual",
          recordedBy,
          transactionId: null,
          date: new Date(),
        };

        // Insert into DB
        const result = await paymentsCollection.insertOne(paymentData);

        // Respond
        res.send({
          insertedId: result.insertedId,
          message: "Manual payment recorded successfully.",
          payment: paymentData,
        });
      } catch (error) {
        console.error("Error inserting manual payment:", error);
        res.status(500).send({
          error: "Failed to insert manual payment record.",
          message: error.message,
        });
      }
    });

    // patch route for the manual payment system
    app.patch("/update-manual-payment-status/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        return res.status(400).send({ error: "ID and status are required." });
      }

      try {
        const result = await paymentsCollection.updateOne(
          { _id: new ObjectId(id), type: "manual" },
          { $set: { status } }
        );
        res.send({ modifiedCount: result.modifiedCount });
      } catch (error) {
        if (process.env.NODE_ENV === "production") {
          console.error("Update error:", error.message);
        }
        res.status(500).send({ error: "Failed to update manual payment." });
      }
    });

    // get specific student payment history
    // ✅ Get all payment history for a student
    app.get("/payment-history/:email", async (req, res) => {
      try {
        const email = req.params.email;

        if (!email) {
          return res.status(400).send({ error: "Email is required." });
        }

        const history = await paymentsCollection
          .find({ userEmail: email })
          .sort({ date: -1 }) // optional: show latest first
          .toArray();

        res.send({ history });
      } catch (error) {
        if (process.env.NODE_ENV === "production") {
          console.error("Failed to fetch payment history:", error.message);
        }
        res
          .status(500)
          .send({ error: "Server error fetching payment history." });
      }
    });

    // ✅ PATCH: Update student course fee secured
    app.patch(
      "/update-student-course-fee/:studentId",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const { studentId } = req.params;
        const { courseId, newFee } = req.body;

        if (!ObjectId.isValid(studentId)) {
          return res.status(400).send({ message: "Invalid student ID" });
        }

        if (!courseId || typeof newFee !== "number") {
          return res
            .status(400)
            .send({ message: "Missing courseId or newFee" });
        }

        try {
          // ✅ Fetch student to get email and course name
          const student = await studentsCollection.findOne({
            _id: new ObjectId(studentId),
          });
          if (!student) {
            return res.status(404).send({ message: "Student not found" });
          }

          const course = student.courses?.find((c) => c.courseId === courseId);
          if (!course) {
            return res
              .status(404)
              .send({ message: "Course not found for this student" });
          }

          const result = await studentsCollection.updateOne(
            {
              _id: new ObjectId(studentId),
              "courses.courseId": courseId,
            },
            {
              $set: { "courses.$.fee": newFee },
            }
          );

          if (result.modifiedCount === 0) {
            return res.status(404).send({ message: "Fee update failed" });
          }

          // ✅ Create notification
          const notification = {
            type: "fee-updated",
            email: student.email,
            courseId,
            courseName: course.courseName || "N/A",
            message: `💰 Your course fee for "${course.courseName}" has been updated to $${newFee}.`,
            applicationDate: new Date(),
            seen: false,
          };

          await notificationCollection.insertOne(notification);

          // ✅ Emit real-time notification to student
          io.to(student.email).emit("student-notification", notification);

          res.send({ success: true, message: "Fee updated successfully" });
        } catch (error) {
          console.error("❌ Error updating student course fee:", error);
          res.status(500).send({ message: "Internal server error" });
        }
      }
    );

    // ✅ PATCH: Update paymentStatus to 'paid' for student's enrolled course secured
    app.patch(
      "/update-student-course-payment-status/:studentEmail",
      verifyToken,
      async (req, res) => {
        const { studentEmail } = req.params;
        const { courseId } = req.body;

        if (!studentEmail || !courseId) {
          return res
            .status(400)
            .send({ error: "Missing studentEmail or courseId" });
        }

        // Only the student themselves can update their payment status
        if (req.user.email !== studentEmail) {
          return res.status(403).send({ error: "Forbidden: Access denied" });
        }

        try {
          const result = await studentsCollection.updateOne(
            { email: studentEmail, "courses.courseId": courseId },
            {
              $set: {
                "courses.$.paymentStatus": "paid",
              },
            }
          );

          if (result.modifiedCount === 0) {
            return res
              .status(404)
              .send({ error: "Student course not found or already paid" });
          }

          res.send({
            success: true,
            message: "Payment status updated to paid",
          });
        } catch (error) {
          console.error("❌ Error updating payment status:", error);
          res.status(500).send({ error: "Internal Server Error" });
        }
      }
    );

    // delete-course secured
    app.delete(
      "/delete-course/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await courseCollection.deleteOne(filter);
        res.send(result);
      }
    );

    // delete-user secured
    app.delete(
      "/delete-user/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(filter);
        res.send(result);
      }
    );

    // delete-faculty secured
    app.delete(
      "/delete-faculty/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await facultiesCollection.deleteOne(filter);
        res.send(result);
      }
    );

    // delete-student secured
    app.delete(
      "/delete-student/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await studentsCollection.deleteOne(filter);
        res.send(result);
      }
    );

    // delete-material secured
    app.delete("/delete-material/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid material ID" });
      }

      try {
        const material = await materialsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!material) {
          return res.status(404).send({ message: "Material not found" });
        }

        // ✅ Allow only the uploader (faculty) to delete
        if (req.user.email !== material.email) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `🚫 Unauthorized delete attempt by ${req.user.email} for material ${id}`
            );
          }
          return res.status(403).send({
            message: "Forbidden: Only the uploader can delete this material",
          });
        }

        const result = await materialsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Material deleted by ${req.user.email}: ${id}`);
        }

        res.send({ success: true, deletedCount: result.deletedCount });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Error deleting material:", error);
        }
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // delete-assignment secured
    app.delete("/delete-assignment/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid assignment ID" });
      }

      try {
        const assignment = await assignmentsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!assignment) {
          return res.status(404).send({ message: "Assignment not found" });
        }

        // ✅ Only the faculty who uploaded it can delete
        if (req.user.email !== assignment.email) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `🚫 Unauthorized delete attempt by ${req.user.email} for assignment ${id}`
            );
          }
          return res.status(403).send({
            message: "Forbidden: You can only delete your own assignments",
          });
        }

        const result = await assignmentsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Assignment deleted by ${req.user.email}: ${id}`);
        }

        res.send({ success: true, deletedCount: result.deletedCount });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Error deleting assignment:", error);
        }
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // delete leave request secured
    app.delete("/delete-leaveReq/:id", verifyToken, async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid leave request ID" });
      }

      try {
        const leave = await leavesCollection.findOne({ _id: new ObjectId(id) });

        if (!leave) {
          return res.status(404).send({ message: "Leave request not found" });
        }

        // ✅ Only the student who submitted it can delete
        if (req.user.email !== leave.email) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `🚫 Unauthorized leave delete attempt by ${req.user.email}`
            );
          }
          return res.status(403).send({
            message: "Forbidden: You can only delete your own leave requests",
          });
        }

        const result = await leavesCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Leave request deleted by ${req.user.email}: ${id}`);
        }

        res.send({ success: true, deletedCount: result.deletedCount });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Error deleting leave request:", error);
        }
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // delete weekly  routine secured
    app.delete(
      "/delete/weekly-routine/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const { id } = req.params;
        const filter = { _id: new ObjectId(id) };
        const result = await routinesCollection.deleteOne(filter);
        res.send(result);
      }
    );

    // get user state secured
    app.get("/user-state", verifyToken, verifyAdmin, async (req, res) => {
      const totalUser = await usersCollection.estimatedDocumentCount({});
      const totalStudents = await usersCollection.countDocuments({
        role: "student",
      });
      const totalFaculty = await usersCollection.countDocuments({
        role: "faculty",
      });
      const totalAdmin = await usersCollection.countDocuments({
        role: "admin",
      });
      res.send({
        totalUser,
        totalStudents,
        totalFaculty,
        totalAdmin,
      });
    });

    // GET USER ROLE BY USER EMAIL
    app.get("/user-role/:email", async (req, res) => {
      const email = req.params.email;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const filter = { email };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // get specific user by id secured
    app.get("/specific-user/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      // Allow only admin or faculty
      if (req.user.role !== "admin" && req.user.role !== "faculty") {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // get specific user by email secured
    app.get("/user-details/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      // Allow only admin or faculty
      if (req.user.role !== "admin" && req.user.role !== "faculty") {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }
      const filter = { email };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // get user overview
    app.get("/student/full-overview/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const { semester, courseName } = req.query; // <-- query params

      if (req.user.email !== email && req.user.role !== "admin") {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      try {
        const student = await studentsCollection.findOne({ email });
        if (!student)
          return res.status(404).send({ message: "Student not found" });

        let enrolledCourses = student.courses || [];
        // Filter enrolledCourses by semester if provided
        if (semester && semester !== "All") {
          enrolledCourses = enrolledCourses.filter(
            (c) => c.semester === semester
          );
        }

        const enrolledCourseIds = enrolledCourses.map((c) => c.courseId);
        const totalEnrolled = enrolledCourses.length;

        const distribution = await courseDistributionCollection.findOne({
          program: student.department,
        });
        const totalProgramCourses = distribution
          ? distribution.quarters.reduce(
              (sum, q) => sum + (q.courses?.length || 0),
              0
            )
          : 0;

        const quarterStats = {};
        for (const course of enrolledCourses) {
          const sem = course.semester || "Unknown";
          if (!quarterStats[sem]) quarterStats[sem] = [];
          quarterStats[sem].push(course);
        }

        const attendanceRecords = await attendanceCollection
          .find({ courseId: { $in: enrolledCourseIds } })
          .sort({ date: 1 })
          .toArray();

        let totalAttendanceDays = 0;
        let presentDays = 0;

        // Daily attendance report with filtering by semester & courseName
        const dailyAttendanceReport = {};

        for (const record of attendanceRecords) {
          const studentStatus = record.students.find((s) => s.email === email);
          if (studentStatus) {
            const course = enrolledCourses.find(
              (c) => c.courseId === record.courseId
            );
            const courseNameCurrent = course?.courseName || "Unknown";
            const semesterCurrent = course?.semester || "Unknown";

            // Skip if semester filter applied and doesn't match
            if (semester && semester !== "All" && semesterCurrent !== semester)
              continue;
            // Skip if courseName filter applied and doesn't match
            if (
              courseName &&
              courseName !== "All" &&
              courseNameCurrent !== courseName
            )
              continue;

            totalAttendanceDays++;
            if (studentStatus.status === "present") presentDays++;

            if (!dailyAttendanceReport[semesterCurrent]) {
              dailyAttendanceReport[semesterCurrent] = {};
            }

            if (!dailyAttendanceReport[semesterCurrent][courseNameCurrent]) {
              dailyAttendanceReport[semesterCurrent][courseNameCurrent] = [];
            }

            dailyAttendanceReport[semesterCurrent][courseNameCurrent].push({
              date: record.date,
              status: studentStatus.status,
            });
          }
        }

        const attendancePercentage =
          totalAttendanceDays > 0
            ? (presentDays / totalAttendanceDays) * 100
            : 0;

        const gradeDoc = await gradesCollection.findOne({
          studentEmail: email,
        });
        let gradePercentage = 0;

        // New: filter grades by semester if semester is provided and not "All"
        let filteredGrades = gradeDoc?.grades || [];
        if (semester && semester !== "All") {
          filteredGrades = filteredGrades.filter(
            (g) => g.semester === semester
          );
        }

        if (filteredGrades.length > 0) {
          const totalPoints = filteredGrades.reduce(
            (sum, g) => sum + g.point,
            0
          );
          const totalOutOf = filteredGrades.reduce(
            (sum, g) => sum + (g.outOf || 4),
            0
          );
          gradePercentage =
            totalOutOf > 0 ? (totalPoints / totalOutOf) * 100 : 0;
        } else {
          gradePercentage = 0;
        }

        const allAssignments = await assignmentsCollection
          .find({ courseId: { $in: enrolledCourseIds } })
          .toArray();

        const submittedAssignments = await subAssignmentsCollection
          .find({ email })
          .toArray();

        const submittedMap = new Map(
          submittedAssignments.map((sa) => [sa.assignmentId, sa])
        );

        const detailedAssignments = allAssignments.map((assign) => {
          const submitted = submittedMap.get(assign._id.toString());
          const relatedCourse = enrolledCourses.find(
            (c) => c.courseId === assign.courseId
          );
          return {
            assignmentId: assign._id.toString(),
            title: assign.title || "Untitled",
            courseName: relatedCourse?.courseName || "Unknown",
            semester: relatedCourse?.semester || "Unknown",
            releasedDate: assign.uploadedAt || assign.createdAt || null,
            submittedDate: submitted?.uploadedAt || null,
            status: submitted ? "Submitted" : "Pending",
            submittedFile: submitted?.path || null,
          };
        });

        const totalAssignmentsReleased = allAssignments.length;
        const totalAssignmentsSubmitted = submittedAssignments.length;

        const payments = await paymentsCollection
          .find({ userEmail: email })
          .sort({ date: -1 })
          .toArray();

        res.send({
          profile: student,
          stats: {
            totalProgramCourses,
            totalEnrolled,
            attendancePercentage: Number(attendancePercentage.toFixed(2)),
            gradePercentage: Number(gradePercentage.toFixed(2)),
            enrollmentPercentage:
              totalProgramCourses > 0
                ? Number(
                    ((totalEnrolled / totalProgramCourses) * 100).toFixed(2)
                  )
                : 0,
            totalAssignmentsReleased,
            totalAssignmentsSubmitted,
          },
          enrolledCourses,
          quarterStats,
          gradeDetails: filteredGrades, // updated to filtered grades by semester
          payments,
          assignments: detailedAssignments,
          dailyAttendanceReport, // filtered by semester & courseName
        });
      } catch (err) {
        console.error("❌ Error in /student/full-overview:", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get-courses from db secured
    app.get("/all-courses-by-department", async (req, res) => {
      try {
        const department = req.query.department;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const query = { department };

        let courses;
        let total;

        // If page and limit are both provided, apply pagination
        if (!isNaN(page) && !isNaN(limit)) {
          const skip = (page - 1) * limit;
          total = await courseCollection.countDocuments(query);
          courses = await courseCollection
            .find(query)
            .skip(skip)
            .limit(limit)
            .toArray();
        } else {
          // Default: return all courses (no pagination)
          courses = await courseCollection.find(query).toArray();
          total = courses.length;
        }

        res.send({ total, courses });
      } catch (error) {
        console.error("Error in paginated course fetch:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // get-faculties secured
    app.get("/all-faculties", verifyToken, verifyAdmin, async (req, res) => {
      const filter = { role: "Faculty" };
      const result = await facultiesCollection.find(filter).toArray();
      const totalStaff = await facultiesCollection.estimatedDocumentCount();
      res.send({ result, totalStaff });
    });

    // get-specific-faculty by id secured
    app.get(
      "/specific-faculty/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const { id } = req.params;
        const filter = { _id: new ObjectId(id) };
        const result = await facultiesCollection.findOne(filter);
        res.send(result);
      }
    );

    // get-specific-faculty by email secured
    app.get("/faculty-email/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const result = await facultiesCollection.findOne({ email });
      if (!result) {
        return res.status(404).send({ error: "Faculty not found" });
      }
      res.send(result);
    });

    // get faculty quarter report
    app.get("/faculty-quarter-report/:email", async (req, res) => {
      const { email } = req.params;
      const { quarter } = req.query; // Filter data by quarter

      try {
        // Initialize an object to store the results
        const reportData = {
          assignedCourses: [],
          assignments: [],
          materials: [],
          totalClasses: 0,
          completedClasses: 0,
          canceledClasses: 0,
        };

        // Fetch Assigned Courses by Quarter
        const courseQuery = {
          facultyEmail: email,
          semester: quarter,
        };

        const courses = await courseCollection.find(courseQuery).toArray();
        reportData.assignedCourses = courses;

        // Fetch Created Assignments by Quarter
        const assignmentQuery = {
          email,
          semester: quarter,
        };

        const assignments = await assignmentsCollection
          .find(assignmentQuery)
          .toArray();
        reportData.assignments = assignments;

        // Fetch Uploaded Materials by Quarter
        // Extract course IDs and titles
        const courseIds = courses.map((course) => course.courseId);
        const courseTitles = courses.map((course) => course.name);

        // Fetch Uploaded Materials by Quarter (no need for the quarter check here)
        const materials = await materialsCollection.find({ email }).toArray();

        // Filter the materials to match assigned course IDs or titles
        const filteredMaterials = materials.filter(
          (material) =>
            courseIds.includes(material.courseId) ||
            courseTitles.includes(material.title)
        );

        reportData.materials = filteredMaterials;

        // Fetch Classes from Routines Collection by Quarter (using semester as filter)
        const routineQuery = {
          "routines.facultyEmails": email, // Filter by faculty's email in routines
        };
        if (quarter) {
          routineQuery.semester = quarter;
        }

        const routines = await routinesCollection.find(routineQuery).toArray();

        routines.forEach((routine) => {
          routine.routines.forEach((classItem) => {
            if (classItem.facultyEmails.includes(email)) {
              reportData.totalClasses += 1;
              if (classItem.status === "completed") {
                reportData.completedClasses += 1;
              } else if (classItem.status === "canceled") {
                reportData.canceledClasses += 1;
              }
            }
          });
        });

        // Send the aggregated data as the response
        res.send(reportData);
      } catch (err) {
        console.error("Error generating quarterly report:", err);
        res.status(500).send({ message: "Error generating quarterly report" });
      }
    });

    // get specific courses from db
    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await courseCollection.findOne(filter);
      res.send(result);
    });

    // get faculty assign courses
    app.get("/faculty-assign/courses/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      // 🔐 Authorization check: only self or admin can access
      const isSelf = req.user?.email === email;
      const isAdmin = req.user?.role === "admin";

      if (!isSelf && !isAdmin) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      try {
        const filter = { facultyEmail: email };
        const total = await courseCollection.countDocuments(filter);
        let result;

        if (!isNaN(page) && !isNaN(limit)) {
          const skip = (page - 1) * limit;
          result = await courseCollection
            .find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        } else {
          result = await courseCollection
            .find(filter)
            .sort({ date: -1 })
            .toArray();
        }

        res.send({
          courses: result,
          total,
        });
      } catch (error) {
        console.error("❌ Error fetching faculty-assigned courses:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // ✅ Filter faculty-assigned courses by quarter (semester)
    app.get(
      "/faculty-assign/courses-by-quarter",
      verifyToken,
      async (req, res) => {
        const { email, semester } = req.query;

        if (!email || !semester) {
          return res
            .status(400)
            .send({ message: "Email and semester are required" });
        }

        const isSelf = req.user?.email === email;
        const isAdmin = req.user?.role === "admin";

        if (!isSelf && !isAdmin) {
          return res.status(403).send({ message: "Forbidden: Access denied" });
        }

        try {
          const filter = {
            facultyEmail: email,
            semester,
          };

          const courses = await courseCollection
            .find(filter)
            .sort({ date: -1 })
            .toArray();

          res.send(courses);
        } catch (error) {
          console.error("❌ Error fetching courses by quarter:", error);
          res.status(500).send({ message: "Internal Server Error" });
        }
      }
    );

    // get faculties dashboard state
    app.get("/faculty-dashboard/state/:email", async (req, res) => {
      try {
        const { email } = req.params;

        const totalCourses = await courseCollection.countDocuments({
          facultyEmail: email,
        });
        const totalAssignments = await assignmentsCollection.countDocuments({
          email: email,
        });
        const totalStudents = await usersCollection.countDocuments({
          role: "student",
        });

        res.send({ totalCourses, totalAssignments, totalStudents });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch dashboard data" });
      }
    });

    // GET all faculties by department
    app.get("/faculties-by-department", async (req, res) => {
      const { department } = req.query;
      if (!department)
        return res.status(400).send({ error: "Department is required" });

      const result = await courseCollection.find({ department }).toArray();
      res.send(result);
    });

    // get all users from db secured
    app.get("/all-users", async (req, res) => {
      const userRole = req.query.role;
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      const filter = userRole ? { role: userRole } : {};

      try {
        const query = usersCollection.find(filter);

        let users;
        if (!isNaN(page) && !isNaN(limit)) {
          users = await query
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();
        } else {
          users = await query.toArray(); // fallback: return all
        }

        const total = await usersCollection.countDocuments(filter);
        res.send({ users, total });
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // get all students secured
    app.get("/all-students", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { name } = req.query;

        let filter = {};

        if (name && typeof name === "string" && name.trim() !== "") {
          filter.name = { $regex: name.trim(), $options: "i" };
        }

        const students = await studentsCollection.find(filter).toArray();

        res.send(students);
      } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });
    // get students stats
    // ✅ GET: Student dashboard state (attendance %, grade %, enrollment %)
    app.get(
      "/student-dashboard-state/:email",
      verifyToken,
      async (req, res) => {
        const { email } = req.params;

        // 🔐 Access Control
        if (req.user.email !== email || req.user.role !== "student") {
          console.warn("🚫 Unauthorized access attempt by:", req.user.email);
          return res.status(403).send({ message: "Forbidden: Access denied" });
        }

        try {
          // 1. Fetch student info
          const student = await studentsCollection.findOne({ email });
          if (!student) {
            console.error("❌ Student not found for email:", email);
            return res.status(404).send({ message: "Student not found" });
          }

          const enrolledCourses = student.courses || [];

          // 2. Attendance Percentage
          const attendanceRecords = await attendanceCollection
            .find({ courseId: { $in: enrolledCourses.map((c) => c.courseId) } })
            .toArray();

          let totalAttendanceDays = 0;
          let presentDays = 0;

          for (const record of attendanceRecords) {
            const found = record.students.find((s) => s.email === email);
            if (found) {
              totalAttendanceDays++;
              if (found.status === "present") presentDays++;
            }
          }

          const attendancePercentage =
            totalAttendanceDays > 0
              ? (presentDays / totalAttendanceDays) * 100
              : 0;

          // 3. Grade Percentage
          const gradeDoc = await gradesCollection.findOne({
            studentEmail: email,
          });

          let totalPoints = 0;
          let totalOutOf = 0;

          if (gradeDoc?.grades?.length > 0) {
            for (const grade of gradeDoc.grades) {
              totalPoints += grade.point || 0;
              totalOutOf += grade.outOf || 4.0;
            }
          }

          const gradePercentage =
            totalOutOf > 0 ? (totalPoints / totalOutOf) * 100 : 0;

          // 4. Enrollment Percentage
          const courseDistribution = await courseDistributionCollection.findOne(
            {
              program: student.department,
            }
          );

          const totalProgramCourses = courseDistribution
            ? courseDistribution.quarters.reduce(
                (acc, q) => acc + (q.courses?.length || 0),
                0
              )
            : 0;

          const enrollmentPercentage =
            totalProgramCourses > 0
              ? (enrolledCourses.length / totalProgramCourses) * 100
              : 0;

          // ✅ Final Response
          const responseData = {
            email,
            name: student.name || "",
            attendancePercentage: Number(attendancePercentage.toFixed(2)),
            gradePercentage: Number(gradePercentage.toFixed(2)),
            enrollmentPercentage: Number(enrollmentPercentage.toFixed(2)),
          };

          res.send(responseData);
        } catch (err) {
          console.error("❌ Error in student dashboard route:", err);
          res.status(500).send({ message: "Server error" });
        }
      }
    );

    // ✅ Get student full details with enrolled courses (including courseId) secured
    app.get("/student-full-details/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      const requesterEmail = req.user?.email;
      const requesterRole = req.user?.role;

      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      const isAdminOrFaculty =
        requesterRole === "admin" || requesterRole === "faculty";
      const isSameStudent =
        requesterRole === "student" && requesterEmail === email;

      if (!isAdminOrFaculty && !isSameStudent) {
        return res.status(403).send({
          message: "Forbidden: You are not authorized to access this data",
        });
      }

      try {
        const student = await studentsCollection.findOne({ email });

        if (!student) {
          return res.status(404).send({ message: "Student not found" });
        }

        let fullCourseList = Array.isArray(student.courses)
          ? student.courses
          : [];
        const totalCourses = fullCourseList.length;

        // 🔄 Apply pagination only if page & limit are valid
        let paginatedCourses = fullCourseList;
        if (!isNaN(page) && !isNaN(limit)) {
          const start = (page - 1) * limit;
          paginatedCourses = fullCourseList.slice(start, start + limit);
        }

        const courseObjectIds = paginatedCourses.map(
          (c) => new ObjectId(c.courseId)
        );
        const enrolledCourses = await courseCollection
          .find({ _id: { $in: courseObjectIds } })
          .project({ name: 1, credit: 1, semester: 1, courseId: 1 })
          .toArray();

        const enrichedCourses = paginatedCourses.map((course) => {
          const match = enrolledCourses.find(
            (c) => c.courseId === course.courseId
          );
          return {
            ...course,
            ...match,
          };
        });

        const studentWithCourses = {
          ...student,
          courses: enrichedCourses,
        };

        res.send({
          student: studentWithCourses,
          totalCourses,
        });
      } catch (err) {
        console.error("❌ Error fetching student full details:", err);
        res.status(500).send({ error: "Server error" });
      }
    });

    //  Get students enrolled in a specific course by course _id for courseDetails secured
    app.get("/students-by-course/:id", verifyToken, async (req, res) => {
      const { id } = req.params;

      if (!id) {
        return res.status(400).send({ message: "Course ID is required" });
      }

      try {
        const course = await courseCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!course) {
          return res.status(404).send({ message: "Course not found" });
        }

        // 🔐 Only allow admin or the faculty assigned to the course
        const isAdmin = req.user.role === "admin";
        const isAssignedFaculty =
          req.user.role === "faculty" && req.user.email === course.facultyEmail;

        if (!isAdmin && !isAssignedFaculty) {
          return res.status(403).send({ message: "Forbidden: Access denied" });
        }

        const students = await studentsCollection
          .find({
            "courses.courseId": id,
          })
          .project({ name: 1, email: 1, photo: 1, department: 1, country: 1 })
          .toArray();

        if (students.length === 0) {
          return res
            .status(404)
            .send({ message: "No students enrolled in this course." });
        }

        res.send(students);
      } catch (error) {
        console.error("❌ Error fetching students by course:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // get course enrolled based student for the grades page secured
    app.get("/students-by-course", verifyToken, async (req, res) => {
      const courseId = req.query.courseId;
      const semester = req.query.semester;
      if (!courseId || !semester) {
        return res.status(400).send({ error: "Missing courseId or semester" });
      }

      try {
        // 🔍 Find the actual course by courseId string (e.g., "CS101")
        const course = ObjectId.isValid(courseId)
          ? await courseCollection.findOne({ _id: new ObjectId(courseId) })
          : await courseCollection.findOne({ courseId: courseId });
        if (!course) {
          return res.status(404).send({ error: "Course not found" });
        }

        // 🔐 Only allow access if admin or the assigned faculty
        const isAdmin = req.user.role === "admin";
        const isAssignedFaculty =
          req.user.role === "faculty" && req.user.email === course.facultyEmail;

        if (!isAdmin && !isAssignedFaculty) {
          return res.status(403).send({ message: "Forbidden: Access denied" });
        }

        const courseObjectId = course._id.toString();

        // Fetch students enrolled in that course (_id match)
        const students = await studentsCollection
          .find({
            courses: {
              $elemMatch: {
                courseId: courseObjectId,
              },
            },
          })
          .project({ name: 1, email: 1, photo: 1 })
          .toArray();

        // Fetch grades for those students (by email)
        const studentEmails = students.map((s) => s.email);
        const gradeRecords = await gradesCollection
          .find({ studentEmail: { $in: studentEmails }, semester })
          .toArray();

        const studentMap = students.map((student) => {
          const gradeDoc = gradeRecords.find(
            (g) => g.studentEmail === student.email
          );
          let alreadyGraded = null;

          if (gradeDoc && Array.isArray(gradeDoc.grades)) {
            const foundGrade = gradeDoc.grades.find(
              (g) => g.courseId === courseId && g.semester === semester
            );
            if (foundGrade) {
              alreadyGraded = { point: foundGrade.point };
            }
          }

          return {
            name: student.name,
            email: student.email,
            photo: student.photo,
            alreadyGraded, // Will be null if not graded
          };
        });

        res.send(studentMap);
      } catch (error) {
        console.error("❌ Error fetching students with grade status:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // get specific students secured route
    app.get("/student/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      if (
        req.user.email !== email &&
        req.user.role !== "admin" &&
        req.user.role !== "faculty"
      ) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }
      const filter = { email };
      const result = await studentsCollection.findOne(filter);
      res.send(result);
    });

    // get specific student attendance secured
    app.get("/student-assignment/:email", verifyToken, async (req, res) => {
      const { email } = req.params;

      // 🔐 Allow only the logged-in student to access their own assignment
      if (req.user.email !== email) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      const cursor = attendanceCollection.find({ "students.email": email });

      const allDocs = await cursor.toArray();

      const studentAttendance = allDocs.map((doc) => {
        const student = doc.students.find((s) => s.email === email);
        return {
          date: doc.date,
          courseId: doc.courseId,
          status: student?.status || "not found",
          takenBy: doc.takenBy,
          createdAt: doc.createdAt,
        };
      });
      res.send({ email, records: studentAttendance });
    });

    // get all materials secured
    app.get("/materials/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // 🔐 Allow only admin or the same faculty
      if (req.user.role !== "admin" && req.user.email !== email) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      const filter = { email };

      try {
        const total = await materialsCollection.countDocuments(filter);
        const materials = await materialsCollection
          .find(filter)
          .skip(skip)
          .limit(limit)
          .toArray();

        res.send({ materials, total });
      } catch (error) {
        console.error("Error fetching materials:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // ✅  get real courseId but still named as 'courseId' secured
    app.get("/assignments/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const isAdmin = req.user.role === "admin";
      const isSameFaculty = req.user.email === email;
      const isStudent = req.user.role === "student";

      if (!isAdmin && !isSameFaculty && !isStudent) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      try {
        // Step 1: If student, get department
        let studentDepartment = null;
        if (isStudent) {
          const student = await studentsCollection.findOne({
            email: req.user.email,
          });
          if (!student) {
            return res.status(404).send({ message: "Student not found" });
          }
          studentDepartment = student.department;
        }

        // Step 2: Build main aggregation pipeline
        const pipeline = [
          { $match: { email } },
          {
            $lookup: {
              from: "courses",
              let: { assignmentCourseId: { $toObjectId: "$courseId" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$assignmentCourseId"] },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    courseId: 1,
                    name: 1,
                    department: 1,
                  },
                },
              ],
              as: "courseInfo",
            },
          },
          {
            $unwind: {
              path: "$courseInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              assignmentId: "$_id",
              courseId: "$courseInfo.courseId",
              courseName: "$courseInfo.name",
              courseDepartment: "$courseInfo.department",
              title: 1,
              email: 1,
              deadline: 1,
              semester: 1,
              uploadedAt: 1,
              filename: 1,
              path: 1,
              instructions: 1,
            },
          },
        ];

        // Step 3: If student, filter by department after projection
        if (isStudent) {
          pipeline.push({
            $match: {
              courseDepartment: studentDepartment,
            },
          });
        }

        // Step 4: Clone the pipeline to count total
        const totalPipeline = [...pipeline, { $count: "total" }];
        const totalResult = await assignmentsCollection
          .aggregate(totalPipeline)
          .toArray();
        const total = totalResult[0]?.total || 0;

        // Step 5: Apply pagination
        pipeline.push({ $skip: skip }, { $limit: limit });

        const paginatedAssignments = await assignmentsCollection
          .aggregate(pipeline)
          .toArray();

        res.send({
          total,
          assignments: paginatedAssignments,
        });
      } catch (error) {
        console.error("❌ Error fetching assignments:", error);
        res.status(500).send({ error: "Failed to fetch assignments" });
      }
    });

    // get all assignment with the status secured
    app.get("/students-assignment/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      // 🔐 Allow only the student themselves
      if (req.user.email !== email) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      try {
        // 1. Get student's enrolled courses
        const student = await studentsCollection.findOne({ email });
        if (!student || !student.courses) {
          return res.send([]); // Return empty if no student or not enrolled
        }

        const enrolledCourseIds = student.courses.map((c) => c.courseId);

        // 2. Get assignments for enrolled courses with submission info
        const assignments = await assignmentsCollection
          .aggregate([
            {
              $match: {
                courseId: { $in: enrolledCourseIds },
              },
            },
            {
              $lookup: {
                from: "subAssignment",
                let: { assignmentId: { $toString: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$assignmentId", "$$assignmentId"] },
                          { $eq: ["$email", email] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      submitted: { $literal: true },
                      path: 1,
                    },
                  },
                ],
                as: "submission",
              },
            },
            {
              $unwind: {
                path: "$submission",
                preserveNullAndEmptyArrays: true,
              },
            },
          ])
          .toArray();

        res.send(assignments);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // get specific materials
    app.get("/material/:id", async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid material ID" });
      }

      try {
        const material = await materialsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!material) {
          return res.status(404).send({ message: "Material not found" });
        }

        // 🔍 Lookup department from course collection using courseId
        const course = await courseCollection.findOne({
          courseId: material.courseId,
        });
        const department = course?.department || "";

        // ✅ Merge and return
        res.send({ ...material, department });
      } catch (error) {
        console.error("❌ Error fetching material:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get material department wise secured
    app.get("/materials-by-department", verifyToken, async (req, res) => {
      const { department } = req.query;

      if (!department) {
        return res.status(400).send({ message: "Department is required" });
      }

      try {
        const result = await materialsCollection
          .find({ department })
          .sort({ uploadedAt: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("❌ Error fetching materials by department:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get specific assignment secured
    app.get("/assignment/:id", verifyToken, async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid assignment ID" });
      }

      try {
        const assignment = await assignmentsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!assignment) {
          return res.status(404).send({ message: "Assignment not found" });
        }

        const assignmentFaculty = assignment.email;
        const assignmentCourseId = assignment.courseId;

        // Admin or assigned faculty can access directly
        if (req.user.role === "admin" || req.user.email === assignmentFaculty) {
          return res.send(assignment);
        }

        // If student, verify department match via course
        if (req.user.role === "student") {
          const student = await studentsCollection.findOne({
            email: req.user.email,
          });

          if (!student) {
            return res
              .status(403)
              .send({ message: "Forbidden: Student not found" });
          }

          const course = await courseCollection.findOne({
            _id: new ObjectId(assignmentCourseId),
          });

          if (!course) {
            return res.status(404).send({ message: "Course not found" });
          }

          if (student.department !== course.department) {
            return res
              .status(403)
              .send({ message: "Forbidden: Not authorized" });
          }

          return res.send(assignment);
        }

        return res.status(403).send({ message: "Forbidden: Access denied" });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Error fetching assignment:", err);
        }
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // Get all student submissions for a specific assignment secured
    app.get(
      "/assignment-submissions/:assignmentId",
      verifyToken,
      async (req, res) => {
        const { assignmentId } = req.params;

        // Validate assignment ownership
        const assignment = await assignmentsCollection.findOne({
          _id: new ObjectId(assignmentId),
        });

        if (!assignment) {
          return res.status(404).send({ message: "Assignment not found" });
        }

        const isOwner = req.user.email === assignment.email;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
          return res.status(403).send({ message: "Forbidden: Access denied" });
        }

        // Fetch submissions
        const submissions = await subAssignmentsCollection
          .find({ assignmentId })
          .project({
          _id: 1,
          email: 1,
          comments: 1,
          filename: 1,     
          originalname: 1, 
          size: 1,         
          mimetype: 1,     
          uploadedAt: 1,
          firebaseUrl: 1,  
        })
          .toArray();

        // Enrich with student name, photo, and submittedAt alias
        const enrichedSubmissions = await Promise.all(
          submissions.map(async (sub) => {
            const student = await studentsCollection.findOne(
              { email: sub.email },
              { projection: { name: 1, photo: 1 } }
            );

            return {
              ...sub,
              studentName: student?.name || "Unknown",
              studentPhoto: student?.photo || null,
              submittedAt: sub.uploadedAt || null, // Add alias
            };
          })
        );

        res.send(enrichedSubmissions);
      }
    );

    // GET: Fetch submitted attendance data for a specific course and date
    app.get("/submitted-attendance", async (req, res) => {
      const { courseId, date } = req.query;
      try {
        const record = await attendanceCollection.findOne({ courseId, date });
        if (!record) {
          return res.status(404).send({ message: "Attendance not found" });
        }
        res.send({ students: record.students });
      } catch (error) {
        console.error("Error fetching submitted attendance:", error);
        res
          .status(500)
          .send({ message: "Server error while fetching attendance" });
      }
    });

    // GET: Get attendance report by course
    app.get("/attendance-report/:courseId", verifyToken, async (req, res) => {
      const { courseId } = req.params;
      const records = await attendanceCollection.find({ courseId }).toArray();
      res.send(records);
    });

    // get attendance status
    app.get("/attendance-status", verifyToken, async (req, res) => {
      const { courseId, date } = req.query;
      const existing = await attendanceCollection.findOne({ courseId, date });
      res.send({ submitted: !!existing });
    });
    // students leave for specific student
    app.get("/student-leave/request/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const filter = { email };
      const result = await leavesCollection.find(filter).toArray();
      res.send(result);
    });
    // ✅ Faculty-specific leave requests
    app.get("/faculty-leaves", verifyToken, async (req, res) => {
      const { facultyEmail, courseId } = req.query;
      if (!facultyEmail || !courseId) {
        return res
          .status(400)
          .send({ error: "facultyEmail and courseId are required" });
      }

      try {
        // Step 1: Verify the course belongs to the faculty
        const isAssigned = await courseCollection.findOne({
          _id: new ObjectId(courseId),
          facultyEmail,
        });

        if (!isAssigned) {
          return res
            .status(403)
            .send({ error: "Unauthorized access to course" });
        }

        // Step 2: Get all students enrolled in this course
        const students = await studentsCollection
          .find({
            courses: {
              $elemMatch: { courseId },
            },
          })
          .project({ email: 1 })
          .toArray();

        const studentEmails = students.map((s) => s.email);

        // Step 3: Get today's ISO date string part (YYYY-MM-DD)
        const todayDateStr = new Date().toISOString().split("T")[0];

        // Step 4: Match applicationDate string starting with todayDateStr
        const leaves = await leavesCollection
          .find({
            email: { $in: studentEmails },
            applicationDate: { $regex: `^${todayDateStr}` },
          })
          .sort({ applicationDate: -1 })
          .toArray();
        res.send(leaves);
      } catch (err) {
        console.error("Error fetching course-specific leaves:", err);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // Get specific student grade with optional semester filter
app.get("/student-result/:email", verifyToken, async (req, res) => {
  const { email } = req.params;
  const { semester } = req.query;

  // 🔐 Ensure the authenticated student can access only their own results
  if (req.user.email !== email) {
    return res.status(403).send({ message: "Forbidden: Access denied" });
  }

  try {
    let filter = { studentEmail: email };

    if (semester) {
      filter.semester = semester;
      const result = await gradesCollection.findOne(filter);
      return res.send(result || { message: "No result found for this semester" });
    }

    const results = await gradesCollection.find(filter).toArray();
    res.send(results);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Error fetching student result:", error);
    }
    res.status(500).send({ message: "Internal server error" });
  }
});


    // GET: All weekly routines sorted by months secured
    app.get("/all/weekly-routines", verifyToken, async (req, res) => {
      try {
        // ✅ Restrict access to only admin, faculty, and student
        if (
          req.user.role !== "admin" &&
          req.user.role !== "faculty" &&
          req.user.role !== "student"
        ) {
          return res.status(403).send({ message: "Forbidden: Access denied" });
        }
        const { monthYear } = req.query;
        let filter = {};

        if (monthYear) {
          const [monthName, year] = monthYear.split(" ");
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

          const startOfMonth = new Date(`${year}-${monthIndex + 1}-01`);
          const endOfMonth = new Date(year, monthIndex + 1, 0); // Last day of the month

          filter = {
            weekStartDate: {
              $gte: startOfMonth.toISOString().split("T")[0],
              $lte: endOfMonth.toISOString().split("T")[0],
            },
          };
        }

        const routines = await routinesCollection
          .find(filter)
          .sort({ weekStartDate: -1 })
          .toArray();

        res.send(routines);
      } catch (err) {
        console.error("❌ Failed to fetch weekly routines:", err);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // GET: Fetch single weekly routine by ID secured
    app.get("/get-routine/:routineId", verifyToken, async (req, res) => {
      const { routineId } = req.params;

      if (!ObjectId.isValid(routineId)) {
        return res.status(400).send({ message: "Invalid routine ID" });
      }

      // ✅ Restrict access to only admin, faculty, and student
      if (
        req.user.role !== "admin" &&
        req.user.role !== "faculty" &&
        req.user.role !== "student"
      ) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      try {
        const routine = await routinesCollection.findOne({
          _id: new ObjectId(routineId),
        });

        if (!routine) {
          return res.status(404).send({ message: "Routine not found" });
        }

        res.send(routine);
      } catch (error) {
        console.error("❌ Error fetching routine:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get routine by faculty email
    app.get("/get-weekly/routine/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const { monthYear } = req.query;
      // 🔒 Allow only the matching faculty or admin
      if (req.user.role !== "admin" && req.user.email !== email) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      try {
        const filter = {
          "routines.facultyEmails": email,
        };

        if (monthYear) {
          const [monthName, year] = monthYear.split(" ");
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

          const startOfMonth = new Date(`${year}-${monthIndex + 1}-01`);
          const endOfMonth = new Date(year, monthIndex + 1, 0); // Last day of the month

          filter.weekStartDate = {
            $gte: startOfMonth.toISOString().split("T")[0],
            $lte: endOfMonth.toISOString().split("T")[0],
          };
        }

        const result = await routinesCollection.find(filter).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching faculty weekly routine:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // GET: Routine for a specific student by department (with optional month filter)
    app.get("/student/routine/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const { monthYear } = req.query;

      // 🔐 Ensure the request is made by the same student
      if (req.user.email !== email || req.user.role !== "student") {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      try {
        // Get the student's department
        const student = await studentsCollection.findOne({ email });
        if (!student || !student.department) {
          return res
            .status(404)
            .send({ message: "Student or department not found" });
        }

        let filter = { department: student.department };

        if (monthYear) {
          const [monthName, year] = monthYear.split(" ");
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
          const startOfMonth = new Date(`${year}-${monthIndex + 1}-01`);
          const endOfMonth = new Date(year, monthIndex + 1, 0);

          filter.weekStartDate = {
            $gte: startOfMonth.toISOString().split("T")[0],
            $lte: endOfMonth.toISOString().split("T")[0],
          };
        }

        const routines = await routinesCollection
          .find(filter)
          .sort({ weekStartDate: -1 })
          .toArray();

        res.send(routines);
      } catch (err) {
        console.error("Error fetching student routine:", err);
        res.status(500).send({ message: "Server error" });
      }
    });

    // get specific message by email secured
    app.get("/messages/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      // 🔐 Allow only the user themselves
      if (req.user.email !== email) {
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      try {
        // ✅ Only fetch inbox messages (received)
        const query = {
          recipients: email,
        };

        const total = await messageCollection.countDocuments(query);

        let messages;

        if (!isNaN(page) && !isNaN(limit)) {
          const skip = (page - 1) * limit;
          messages = await messageCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        } else {
          messages = await messageCollection
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
        }

        res.send({ total, messages });
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
        res.status(500).send({ message: "Failed to retrieve messages" });
      }
    });

    // ✅ GET: A single message by its ID secured
    app.get("/message/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid message ID" });
      }

      try {
        const message = await messageCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!message) {
          return res.status(404).send({ message: "Message not found" });
        }
        res.send(message);
      } catch (err) {
        console.error("❌ Error fetching message by ID:", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get all reply for specific message
    app.get("/message/:id/replies", async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid message ID" });
      }

      try {
        const replies = await messageCollection
          .find({ replyTo: id })
          .sort({ createdAt: 1 }) // optional: newest first => sort({ createdAt: -1 })
          .toArray();

        res.send(replies);
      } catch (err) {
        console.error("❌ Error fetching replies:", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get specific user email
    app.get("/user-send/message/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      // 🔐 Ensure the logged-in user is accessing their own messages
      if (req.user.email !== email) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Unauthorized access attempt by:", req.user.email);
        }
        return res.status(403).send({ message: "Forbidden: Access denied" });
      }

      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      try {
        const query = { email };
        const total = await messageCollection.countDocuments(query);

        let messages;

        if (!isNaN(page) && !isNaN(limit)) {
          const skip = (page - 1) * limit;
          messages = await messageCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        } else {
          messages = await messageCollection
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
        }

        res.send({ total, messages });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Error fetching sent messages:", error);
        }
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get student course outline
    // GET course distribution by department
    // ✅ Safely fetch course outline by department name
    app.get("/course-distribution/:department", async (req, res) => {
      const { department } = req.params;

      if (!department) {
        return res.status(400).send({ message: "Department is required" });
      }

      // ✅ Normalize department names (handles casing, extra spaces, unicode)
      const normalize = (str) =>
        str
          .normalize("NFKC") // Normalize unicode formatting
          .replace(/\u00A0/g, " ") // Replace non-breaking spaces
          .replace(/\s+/g, " ") // Collapse multiple spaces
          .trim() // Remove leading/trailing spaces
          .toLowerCase(); // Make comparison case-insensitive

      try {
        // ✅ Fetch all course outlines
        const allPrograms = await courseDistributionCollection.find().toArray();

        // ✅ Try matching normalized department name
        const matched = allPrograms.find(
          (p) => normalize(p.program) === normalize(department)
        );

        if (!matched) {
          console.log("❌ Normalized not found for:", department);
          return res.status(404).send({ message: "Program not found" });
        }

        // ✅ Return the matching course outline
        res.send(matched);
      } catch (error) {
        console.error("❌ Error fetching course distribution:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get enrollment requests
    app.get("/enrollment-requests/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      const { quarter } = req.query;

      try {
        const filter = { email };
        if (quarter) filter.quarter = quarter;

        const requests = await enrollmentRequestsCollection
          .find(filter)
          .project({
            courseId: 1,
            courseName: 1,
            status: 1,
            requestedAt: 1,
            quarter: 1,
          })
          .sort({ requestedAt: -1 })
          .toArray();
        res.send(requests);
      } catch (err) {
        console.error("Error fetching enrollment requests:", err);
        res.status(500).send({ message: "Failed to fetch requests" });
      }
    });

    //  enrollment request for the courses
    // app.post("/request-enrollment", verifyToken, async (req, res) => {
    //   const {
    //     email,
    //     courseId,
    //     courseCode,
    //     courseName,
    //     studentName,
    //     studentDepartment,
    //   } = req.body;

    //   // Validation
    //   if (!email || !courseId || !courseCode || !courseName || !studentName || !studentDepartment) {
    //     return res.status(400).send({ message: "Missing required fields" });
    //   }

    //   // Prevent duplicate requests
    //   const existing = await enrollmentRequestsCollection.findOne({ email, courseId });
    //   if (existing) {
    //     return res.status(409).send({ message: "Already requested" });
    //   }

    //   // Save request
    //   await enrollmentRequestsCollection.insertOne({
    //     email,
    //     courseId,
    //     courseCode,
    //     courseName,
    //     studentName,
    //     studentDepartment,
    //     status: "pending",
    //     requestedAt: new Date(),
    //   });

    //   // 🔔 Create Admin Notification
    //   const adminNotification = {
    //     type: "enrollment-request",
    //     role: "admin",
    //     email: "academicore4@gmail.com",
    //     studentEmail: email,
    //     studentName,
    //     courseId,
    //     courseName,
    //     message: `📥 ${studentName} has requested to enroll in ${courseName}`,
    //     applicationDate: new Date(),
    //     seen: false,
    //   };

    //   const result = await notificationCollection.insertOne(adminNotification);
    // console.log("Inserted into notificationCollection ✅", result.insertedId);

    //   // Optional: emit via Socket.IO if you're using real-time
    //   io.to("admin-room").emit("admin-notification", adminNotification);

    //   res.send({ success: true, message: "Enrollment request sent" });
    // });

    // POST: Send enrollment request
    app.post("/request-enrollment", verifyToken, async (req, res) => {
      const {
        email,
        courseId,
        courseCode,
        courseName,
        studentName,
        studentDepartment,
        quarter,
      } = req.body;

      // Basic validation
      if (
        !email ||
        !courseId ||
        !courseName ||
        !studentName ||
        !studentDepartment ||
        !courseCode ||
        !quarter
      ) {
        return res.status(400).send({ message: "Missing required fields" });
      }

      // Check for duplicate request
      const existing = await enrollmentRequestsCollection.findOne({
        email,
        courseId,
      });
      if (existing) {
        return res.status(409).send({ message: "Already requested" });
      }

      // Save request directly
      await enrollmentRequestsCollection.insertOne({
        email,
        courseId,
        courseCode,
        courseName,
        studentName,
        studentDepartment,
        quarter,
        status: "pending",
        requestedAt: new Date(),
      });

      res.send({ success: true, message: "Enrollment request sent" });
    });

    //✅ ✅ ✅  notifications routes

    // ✅ Save new course and notify assigned faculty
    app.post("/add-courses", verifyToken, verifyAdmin, async (req, res) => {
      const course = req.body;
      try {
        const result = await courseCollection.insertOne(course);

        // ✅ Store notification in DB
        await notificationCollection.insertOne({
          type: "course-assigned",
          facultyEmail: course.facultyEmail,
          courseId: result.insertedId,
          courseName: course.name,
          applicationDate: new Date(),
          reason: "📚 New Course Assigned",
          seen: false,
        });

        // ✅ Emit notification to faculty-room
        io.to("faculty-room").emit("faculty-notification", {
          type: "course-assigned",
          facultyEmail: course.facultyEmail,
          courseId: result.insertedId,
          courseName: course.name,
          applicationDate: new Date(),
          reason: "📚 New Course Assigned",
        });

        res.send(result);
      } catch (error) {
        console.error("❌ Error adding course or sending notification:", error);
        res.status(500).send({ error: "Failed to add course" });
      }
    });

    // ✅ Notify clients when a new leave is submitted
    app.post("/leave-application", verifyToken, async (req, res) => {
      const application = req.body;
      // 🔐 Ensure the student is applying for their own account
      if (req.user.email !== application.email || req.user.role !== "student") {
        return res
          .status(403)
          .send({ message: "Forbidden: Only the student can apply for leave" });
      }
      const result = await leavesCollection.insertOne(application);

      // Derive facultyEmail from student's first course
      let facultyEmail = null;
      const student = await studentsCollection.findOne({
        email: application.email,
      });

      if (student?.courses?.length) {
        const courseIds = student.courses.map((c) => c.courseId);
        const course = await courseCollection.findOne({
          _id: new ObjectId(courseIds[0]),
        });
        facultyEmail = course?.facultyEmail || null;
      }

      const notification = {
        type: "leave-request",
        facultyEmail,
        email: application.email,
        applicationDate: new Date(),
        reason: application.reason || "📩 New Leave Request",
        seen: false,
      };

      await notificationCollection.insertOne(notification);

      // Emit notification to faculty-room only
      io.to("faculty-room").emit("faculty-notification", notification);
      res.send(result);
    });

    // ✅ POST: Enroll a student into a course + Notify assigned faculty
    app.post("/enroll-course", verifyToken, async (req, res) => {
      try {
        const { email, course } = req.body;

        if (
          (req.user.role === "student" && req.user.email !== email) ||
          (req.user.role !== "student" && req.user.role !== "admin")
        ) {
          return res.status(403).send({
            success: false,
            message: "Forbidden: Students can only enroll themselves",
          });
        }

        if (!email || !course?.courseId || !course?.courseName) {
          return res
            .status(400)
            .send({ success: false, message: "Missing required fields." });
        }

        const user = await usersCollection.findOne({ email });
        const studentName = user?.name || course.studentName || "Unknown";
        const studentPhoto =
          user?.photo ||
          course.photo ||
          "https://i.ibb.co/2K2tkj1/default-avatar.png";

        const filter = { email };

        const update = {
          $setOnInsert: {
            email,
            name: studentName,
            photo: studentPhoto,
            createdAt: new Date(),
          },
          $addToSet: {
            courses: {
              courseId: course.courseId,
              courseName: course.courseName,
              credit: course.credit,
              semester: course.semester,
              fee: course.fee || 0,
              paymentStatus: course.paymentStatus || "unpaid",
              enrolledAt: new Date(course.enrolledAt || Date.now()),
            },
          },
          $set: {
            updatedAt: new Date(),
          },
        };

        const result = await studentsCollection.updateOne(filter, update, {
          upsert: true,
        });

        let actualCourse = null;
        if (ObjectId.isValid(course.courseId)) {
          actualCourse = await courseCollection.findOne({
            _id: new ObjectId(course.courseId),
          });
        }

        if (actualCourse?.facultyEmail) {
          const notification = {
            type: "student-enrolled",
            facultyEmail: actualCourse.facultyEmail,
            email,
            courseId: actualCourse._id.toString(),
            courseName: actualCourse.name,
            applicationDate: new Date(),
            reason: `👨‍🎓 ${studentName} enrolled in ${actualCourse.name}`,
            seen: false,
          };

          await notificationCollection.insertOne(notification);
          io.to("faculty-room").emit("faculty-notification", notification);
        }

        res.send({ success: true, result });
      } catch (error) {
        console.error("❌ Enroll Error:", error);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    // POST: Upsert grades by semester
    app.post("/student-grades/upsert", verifyToken, async (req, res) => {
      try {
        const { studentGrades, semester } = req.body;

        // ✅ Only faculty allowed
        if (req.user.role !== "faculty") {
          return res.status(403).send({
            success: false,
            message: "Forbidden: Only faculty can submit grades",
          });
        }

        if (!Array.isArray(studentGrades) || !semester) {
          return res
            .status(400)
            .send({ success: false, message: "Invalid data" });
        }

        let upsertCount = 0;
        const alreadyGraded = [];

        for (const record of studentGrades) {
          const { studentEmail, courseId, studentName } = record;

          // ✅ Check that the faculty is actually assigned to this course
          let assignedCourse = null;

          if (ObjectId.isValid(courseId)) {
            assignedCourse = await courseCollection.findOne({
              _id: new ObjectId(courseId),
              facultyEmail: req.user.email,
            });
          } else {
            assignedCourse = await courseCollection.findOne({
              courseId,
              facultyEmail: req.user.email,
            });
          }

          if (!assignedCourse) {
            return res.status(403).send({
              success: false,
              message: `Forbidden: You are not assigned to course ${courseId}`,
            });
          }

          const exists = await gradesCollection.findOne({
            studentEmail,
            "grades.courseId": courseId,
            "grades.semester": semester,
          });

          if (exists) {
            alreadyGraded.push({ studentEmail, studentName, courseId });
            continue;
          }

          const filter = { studentEmail, semester };

          const update = {
            $setOnInsert: {
              studentEmail,
              studentName,
              semester,
              createdAt: new Date(),
            },
            $set: {
              updatedAt: new Date(),
            },
            $push: {
              grades: {
                courseId,
                courseCode: record.courseCode || "Unknown Code",
                courseName: record.courseName || "Unknown Course",
                facultyEmail: record.facultyEmail,
                point: parseFloat(record.point),
                outOf: record.outOf || 4.0,
                semester,
                submittedAt: new Date(record.submittedAt),
              },
            },
          };

          await gradesCollection.updateOne(filter, update, { upsert: true });
          upsertCount++;

          let courseName = "Your course";
          let courseDoc = null;

          if (ObjectId.isValid(courseId)) {
            courseDoc = await courseCollection.findOne({
              _id: new ObjectId(courseId),
            });
          } else {
            courseDoc = await courseCollection.findOne({ courseId: courseId });
          }

          if (courseDoc?.name) {
            courseName = courseDoc.name;
          }

          const notification = {
            type: "grade",
            email: studentEmail,
            courseId,
            courseName,
            point: record.point,
            message: `📊 Grade submitted for ${courseName}`,
            applicationDate: new Date(),
            seen: false,
          };

          await notificationCollection.insertOne(notification);
          io.to(studentEmail).emit("student-notification", {
            ...notification,
            time: new Date(),
          });
        }

        if (alreadyGraded.length > 0) {
          return res.send({
            success: false,
            message: `${alreadyGraded.length} grade(s) were already submitted.`,
            alreadyGraded,
            upsertCount,
          });
        }

        res.send({
          success: true,
          message: `${upsertCount} grade(s) submitted successfully.`,
        });
      } catch (err) {
        res.status(500).send({ success: false, message: "Server error." });
      }
    });

    // patch enrollments status
    app.patch(
      "/enrollment-requests/:email/:courseId",
      verifyToken,
      async (req, res) => {
        const { email, courseId } = req.params;
        const { status } = req.body;

        if (!status || !["approved", "declined"].includes(status)) {
          return res
            .status(400)
            .send({ success: false, message: "Invalid status value." });
        }

        const result = await enrollmentRequestsCollection.updateOne(
          { email, courseId },
          { $set: { status, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ success: false, message: "Enrollment request not found." });
        }

        res.send({ success: true, result });
      }
    );

    // ✅ PATCH: Mark faculty notifications as seen
    app.patch("/faculty-notifications/mark-seen", async (req, res) => {
      const { notificationIds } = req.body;
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res
          .status(400)
          .send({ error: "notificationIds must be a non-empty array" });
      }

      try {
        const objectIds = notificationIds.map((id) => new ObjectId(id));

        const result = await notificationCollection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { seen: true } }
        );

        res.send({ success: true, modified: result.modifiedCount });
      } catch (err) {
        console.error("❌ Failed to mark notifications as seen:", err);
        res.status(500).send({ error: "Server error" });
      }
    });

    // get faculties notification route secured
    app.get(
      "/faculties-notifications/:facultyEmail",
      verifyToken,
      async (req, res) => {
        const { facultyEmail } = req.params;

        if (!facultyEmail) {
          return res.status(400).send({ error: "facultyEmail is required" });
        }

        // Security check: Ensure user can only fetch their own notifications
        if (req.user?.email !== facultyEmail) {
          return res.status(403).send({ error: "Forbidden: Email mismatch" });
        }

        try {
          const notifications = await notificationCollection
            .find({ facultyEmail })
            .sort({ applicationDate: -1 })
            .toArray();

          res.send(notifications);
        } catch (err) {
          console.error("❌ Error fetching faculty notifications:", err);
          res.status(500).send({ error: "Server error" });
        }
      }
    );

    // ✅ GET: Fetch student notifications from DB
    app.get("/student-notifications", async (req, res) => {
      const { email } = req.query;
      if (!email) {
        return res.status(400).send({ error: "email is required" });
      }

      try {
        const notifications = await notificationCollection
          .find({
            email,
            type: { $in: ["grade", "assignment", "fee-updated"] },
          })
          .sort({ applicationDate: -1 })
          .toArray();
        res.send(notifications);
      } catch (err) {
        console.error("❌ Error fetching student notifications:", err);
        res.status(500).send({ error: "Server error" });
      }
    });

    // Get Admin Notifications
    app.get("/admin-notifications", async (req, res) => {
      try {
        const notifications = await notificationCollection
          .find({ role: "admin" })
          .sort({ applicationDate: -1 })
          .toArray();

        res.send(notifications);
      } catch (err) {
        console.error("❌ Error fetching admin notifications:", err);
        res.status(500).send({ error: "Failed to fetch admin notifications" });
      }
    });

    //✅ ✅ ✅  upload pdf procedures
    const storage = multer.memoryStorage();

    const upload = multer({
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
          return cb(new Error("Only PDFs allowed"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    });

    // upload materials
    app.post("/upload-file", upload.single("file"), async (req, res) => {
      try {
        console.log("📥 /upload-file route hit");

        const { courseId, title, email, department } = req.body;
        const file = req.file;

        console.log("🧾 Received fields:", {
          courseId,
          title,
          email,
          department,
        });
        console.log("📎 Received file info:", file);

        if (!file) {
          return res.status(400).send({ message: "No file uploaded" });
        }

        if (!file.buffer) {
          return res.status(400).send({ message: "File buffer missing" });
        }

        const uniqueFileName = `${Date.now()}-${file.originalname}`;
        const blob = bucket.file(uniqueFileName);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        blobStream.on("error", (err) => {
          console.error("❌ Firebase upload failed:", err);
          return res.status(500).send({ message: "Firebase upload failed" });
        });

        blobStream.on("finish", async () => {
          console.log("✅ Firebase upload finished");

          // ✅ Make the uploaded file publicly accessible
          await blob.makePublic();

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          console.log("🌐 File accessible at:", publicUrl);

          const material = {
            courseId,
            title,
            email,
            department,
            filename: uniqueFileName,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            uploadedAt: new Date().toISOString(),
            firebaseUrl: publicUrl,
          };

          const result = await materialsCollection.insertOne(material);
          console.log("📦 Material saved to DB:", result.insertedId);

          res.send({
            message: "Uploaded to Firebase and saved to DB",
            firebaseUrl: publicUrl,
            result,
          });
        });

        blobStream.end(file.buffer); // ✅ Start Firebase upload
      } catch (err) {
        console.error("❌ Upload failed:", err);
        res.status(500).send({ message: "Upload failed" });
      }
    });

        // ✅ POST: Send & store message
app.post("/send-message", upload.single("file"), async (req, res) => {
  const {
    name,
    email,
    subject,
    description,
    recipientRole,
    replyTo,
  } = req.body;

  let recipients = req.body.recipients;
  if (!recipients) recipients = [];
  if (typeof recipients === "string") recipients = [recipients];

  if (
    !name ||
    !email ||
    !subject ||
    !description ||
    !recipients?.length ||
    !recipientRole
  ) {
    return res.status(400).send({ message: "Missing required fields" });
  }

  const message = {
    name,
    email,
    subject,
    description,
    recipients,
    recipientRole,
    sender: email,
    replyTo: replyTo || null,
    createdAt: new Date().toISOString(),
  };

  try {
    // ✅ If a file was uploaded, store it in Firebase Storage
    if (req.file && req.file.buffer) {
      const { getStorage } = require("firebase-admin/storage");
      const bucket = getStorage().bucket();

      const uniqueFileName = `messages/${Date.now()}-${req.file.originalname}`;
      const blob = bucket.file(uniqueFileName);

      const stream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.end(req.file.buffer);

      await new Promise((resolve, reject) => {
        stream.on("finish", async () => {
          try {
            await blob.makePublic(); // ✅ Make file publicly accessible
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        stream.on("error", reject);
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(uniqueFileName)}`;

      message.attachment = {
        filename: req.file.originalname,
        path: publicUrl,
        mimetype: req.file.mimetype,
      };
    }

    const result = await messageCollection.insertOne(message);
    res.send({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error("❌ Message send failed:", err);
    res.status(500).send({ message: "Internal server error" });
  }
});




    // upload assignment
    app.post(
      "/upload-assignment",
      verifyToken,
      upload.single("file"),
      async (req, res) => {
        try {
          console.log("upload trigger");
          const {
            courseId,
            courseCode,
            title,
            instructions,
            email,
            deadline,
            semester,
          } = req.body;
          const file = req.file;

          // ✅ Role check
          if (req.user.role !== "faculty") {
            return res.status(403).send({
              message: "Forbidden: Only faculty can upload assignments",
            });
          }

          // ✅ Course check
          const course = await courseCollection.findOne({
            _id: new ObjectId(courseId),
            facultyEmail: email,
          });

          if (!course) {
            return res.status(403).send({
              message: "Forbidden: You are not assigned to this course",
            });
          }

          if (!file) {
            return res.status(400).send({ message: "No file uploaded" });
          }

          if (!file.buffer) {
            return res.status(400).send({ message: "File buffer missing" });
          }

          // ✅ Upload to Firebase Storage
          const uniqueFileName = `${Date.now()}-${file.originalname}`;
          const blob = bucket.file(uniqueFileName);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype },
          });

          blobStream.on("error", (err) => {
            console.error("❌ Firebase upload error:", err);
            return res
              .status(500)
              .send({ message: "Upload to Firebase failed" });
          });

          blobStream.on("finish", async () => {
            // ✅ Make the file public
            await blob.makePublic();

            const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            const assignment = {
              courseId,
              courseCode,
              semester,
              title,
              instructions,
              email: req.user.email,
              deadline,
              originalname: file.originalname,
              filename: uniqueFileName,
              size: file.size,
              mimetype: file.mimetype,
              uploadedAt: new Date().toISOString(),
              firebaseUrl, // ✅ Added field (optional use in frontend)
            };

            const result = await assignmentsCollection.insertOne(assignment);

            const students = await studentsCollection
              .find({ department: course.department })
              .toArray();

            const now = new Date();
            for (const student of students) {
              const notification = {
                type: "assignment",
                email: student.email,
                courseId,
                courseName: course.name,
                title,
                message: `📚 New assignment posted for ${course.name}`,
                time: now,
                seen: false,
              };

              io.to(student.email).emit("student-notification", notification);
              await notificationCollection.insertOne(notification);
            }

            // ✅ Keep old response format
            res.send(result);
          });

          blobStream.end(file.buffer);
        } catch (err) {
          console.error("❌ Upload failed", err);
          res.status(500).send({ message: "Upload failed" });
        }
      }
    );

    // assignment-submission
    app.post(
      "/assignment-submission",
      verifyToken,
      upload.single("file"),
      async (req, res) => {
        const { assignmentId, email, comments } = req.body;
        const file = req.file;

        // 🔐 Ensure only the logged-in student can submit
        if (req.user.role !== "student" || req.user.email !== email) {
          return res.status(403).send({
            message:
              "Forbidden: Only the logged-in student can submit assignments",
          });
        }

        if (!file || !file.buffer) {
          return res.status(400).send({ message: "No valid file uploaded" });
        }

        try {
          // 🔥 Upload to Firebase Storage
          const uniqueFileName = `${Date.now()}-${file.originalname}`;
          const blob = bucket.file(uniqueFileName);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype },
          });

          blobStream.on("error", (err) => {
            console.error("❌ Firebase upload error:", err);
            return res
              .status(500)
              .send({ message: "Upload to Firebase failed" });
          });

          blobStream.on("finish", async () => {
            // Make the file public
            await blob.makePublic();
            const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            const subAssignment = {
              assignmentId,
              email,
              comments,
              filename: uniqueFileName,
              originalname: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              uploadedAt: new Date().toISOString(),
              firebaseUrl,
            };

            const result = await subAssignmentsCollection.insertOne(
              subAssignment
            );
            res.send(result);
          });

          blobStream.end(file.buffer);
        } catch (err) {
          console.error("❌ Submission upload failed:", err);
          res.status(500).send({ message: "Assignment submission failed" });
        }
      }
    );

    // update material
    app.patch(
      "/update-material/:id",
      verifyToken,
      upload.single("file"),
      async (req, res) => {
        try {
          const { id } = req.params;

          if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID" });
          }

          const existing = await materialsCollection.findOne({
            _id: new ObjectId(id),
          });

          if (!existing) {
            return res.status(404).send({ message: "Material not found" });
          }

          // 🔐 Only the original uploader (faculty) or admin can update
          const isAuthorized =
            req.user.role === "admin" || req.user.email === existing.email;

          if (!isAuthorized) {
            return res.status(403).send({
              message: "Forbidden: Not authorized to update material",
            });
          }

          const { title, courseId, email } = req.body;

          const updateFields = {
            title: title || existing.title,
            courseId: courseId || existing.courseId,
            email: email || existing.email,
            updatedAt: new Date().toISOString(),
          };

          if (req.file && req.file.buffer) {
            const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
            const blob = bucket.file(uniqueFileName);
            const blobStream = blob.createWriteStream({
              metadata: { contentType: req.file.mimetype },
            });

            blobStream.on("error", (err) => {
              console.error("❌ Firebase upload error:", err);
              return res
                .status(500)
                .send({ message: "Upload to Firebase failed" });
            });

            blobStream.on("finish", async () => {
              await blob.makePublic();
              const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

              updateFields.filename = uniqueFileName;
              updateFields.originalname = req.file.originalname;
              updateFields.size = req.file.size;
              updateFields.mimetype = req.file.mimetype;
              updateFields.firebaseUrl = firebaseUrl;

              const result = await materialsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateFields }
              );

              res.send(result);
            });

            blobStream.end(req.file.buffer);
          } else {
            // No new file uploaded, use existing file info
            updateFields.filename = existing.filename;
            updateFields.originalname = existing.originalname;
            updateFields.path = existing.path;
            updateFields.size = existing.size;
            updateFields.mimetype = existing.mimetype;
            updateFields.firebaseUrl = existing.firebaseUrl;

            const result = await materialsCollection.updateOne(
              { _id: new ObjectId(id) },
              { $set: updateFields }
            );

            res.send(result);
          }
        } catch (err) {
          console.error(err);
          res.status(500).send({ message: "Update failed" });
        }
      }
    );

    // update assignment
    app.patch(
      "/update-assignment/:id",
      verifyToken,
      upload.single("file"),
      async (req, res) => {
        try {
          const { id } = req.params;

          if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID" });
          }

          const existing = await assignmentsCollection.findOne({
            _id: new ObjectId(id),
          });

          if (!existing) {
            return res.status(404).send({ message: "Assignment not found" });
          }

          // 🔐 Allow only the assignment creator or admin
          const isAuthorized =
            req.user.role === "admin" || req.user.email === existing.email;

          if (!isAuthorized) {
            return res.status(403).send({
              message: "Forbidden: Not authorized to update assignment",
            });
          }

          const { title, courseId, instructions, email, deadline, semester } =
            req.body;

          const updateFields = {
            title: title || existing.title,
            courseId: courseId || existing.courseId,
            instructions: instructions || existing.instructions,
            email: email || existing.email,
            deadline: deadline || existing.deadline,
            semester: semester || existing.semester,
            updatedAt: new Date().toISOString(),
          };

          if (req.file && req.file.buffer) {
            const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
            const blob = bucket.file(uniqueFileName);
            const blobStream = blob.createWriteStream({
              metadata: { contentType: req.file.mimetype },
            });

            blobStream.on("error", (err) => {
              console.error("❌ Firebase upload error:", err);
              return res
                .status(500)
                .send({ message: "Upload to Firebase failed" });
            });

            blobStream.on("finish", async () => {
              await blob.makePublic();
              const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

              updateFields.filename = uniqueFileName;
              updateFields.originalname = req.file.originalname;
              updateFields.size = req.file.size;
              updateFields.mimetype = req.file.mimetype;
              updateFields.firebaseUrl = firebaseUrl;

              const result = await assignmentsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateFields }
              );

              res.send(result);
            });

            blobStream.end(req.file.buffer);
          } else {
            // No file uploaded, update without file info
            updateFields.filename = existing.filename;
            updateFields.originalname = existing.originalname;
            updateFields.path = existing.path;
            updateFields.size = existing.size;
            updateFields.mimetype = existing.mimetype;
            updateFields.firebaseUrl = existing.firebaseUrl;

            const result = await assignmentsCollection.updateOne(
              { _id: new ObjectId(id) },
              { $set: updateFields }
            );

            res.send(result);
          }
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("❌ Assignment update failed:", err);
          }
          res.status(500).send({ message: "Update failed" });
        }
      }
    );

    // patch to upload the pdf notes per class routine
    app.patch(
      "/upload-routine-note",
      upload.single("file"),
      async (req, res) => {
        const { routineId, dayIndex, course, title, email } = req.body;

        if (!req.file || !req.file.buffer) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // ✅ Validate routineId
        if (!ObjectId.isValid(routineId)) {
          return res.status(400).json({ error: "Invalid routine ID" });
        }

        try {
          const existingRoutine = await routinesCollection.findOne({
            _id: new ObjectId(routineId),
          });

          if (!existingRoutine) {
            return res.status(404).json({ error: "Routine not found" });
          }

          // ✅ Validate dayIndex
          const index = parseInt(dayIndex);
          if (
            isNaN(index) ||
            index < 0 ||
            index >= existingRoutine.routines.length
          ) {
            return res.status(400).json({ error: "Invalid day index" });
          }

          const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
          const blob = bucket.file(uniqueFileName);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: req.file.mimetype },
          });

          blobStream.on("error", (err) => {
            console.error("❌ Firebase upload error:", err);
            return res.status(500).json({ error: "Upload to Firebase failed" });
          });

          blobStream.on("finish", async () => {
            // ✅ Wrap makePublic in try-catch
            try {
              await blob.makePublic();
            } catch (err) {
              console.error("❌ Failed to make file public:", err);
              return res
                .status(500)
                .json({ error: "Failed to make file public" });
            }

            const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            const updateResult = await routinesCollection.updateOne(
              { _id: new ObjectId(routineId) },
              {
                $set: {
                  [`routines.${dayIndex}.notes`]: {
                    title,
                    uploadedBy: email,
                    course,
                    url: firebaseUrl,
                    path: uniqueFileName,
                    uploadedAt: new Date(),
                  },
                },
              }
            );

            if (updateResult.modifiedCount > 0) {
              res.status(200).json({ message: "Note uploaded and saved." });
            } else {
              res
                .status(404)
                .json({ message: "Routine not found or not updated." });
            }
          });

          blobStream.end(req.file.buffer);
        } catch (err) {
          console.error("❌ Routine upload failed:", err);
          res.status(500).json({ error: "Upload failed" });
        }
      }
    );

    // ✅ PATCH: Upload assignment file per class routine
    app.patch(
      "/upload-student-classAssignment",
      upload.single("file"),
      async (req, res) => {
        const { routineId, dayIndex, email, name } = req.body;

        if (!req.file || !req.file.buffer) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        if (!ObjectId.isValid(routineId)) {
          return res.status(400).json({ error: "Invalid routine ID" });
        }

        try {
          const routine = await routinesCollection.findOne({
            _id: new ObjectId(routineId),
          });

          if (!routine) {
            return res.status(404).json({ error: "Routine not found" });
          }

          const index = parseInt(dayIndex);
          if (isNaN(index) || index < 0 || index >= routine.routines.length) {
            return res.status(400).json({ error: "Invalid day index" });
          }

          const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
          const blob = bucket.file(uniqueFileName);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: req.file.mimetype },
          });

          blobStream.on("error", (err) => {
            console.error("❌ Firebase upload error:", err);
            return res.status(500).json({ error: "Upload to Firebase failed" });
          });

          blobStream.on("finish", async () => {
            try {
              await blob.makePublic();
            } catch (err) {
              console.error("❌ Failed to make file public:", err);
              return res
                .status(500)
                .json({ error: "Failed to make file public" });
            }

            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            const subAssignment = {
              studentName: name,
              studentEmail: email,
              fileUrl,
              path: uniqueFileName,
              submittedAt: new Date(),
            };

            const updateResult = await routinesCollection.updateOne(
              { _id: new ObjectId(routineId) },
              {
                $push: {
                  [`routines.${index}.subAssignments`]: subAssignment,
                },
              }
            );

            if (updateResult.modifiedCount > 0) {
              res.status(200).json({
                message: "Student assignment submitted successfully.",
              });
            } else {
              res
                .status(500)
                .json({ message: "Failed to save student assignment." });
            }
          });

          blobStream.end(req.file.buffer);
        } catch (err) {
          console.error("❌ Error uploading student assignment:", err);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    );

    // edit assignment file per class in the routine
    app.patch(
      "/routine/edit-assignment",
      upload.single("file"),
      async (req, res) => {
        const { routineId, dayIndex, email, name, course, title } = req.body;

        if (!req.file || !req.file.buffer) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        if (!ObjectId.isValid(routineId)) {
          return res.status(400).json({ error: "Invalid routine ID" });
        }

        try {
          const routine = await routinesCollection.findOne({
            _id: new ObjectId(routineId),
          });

          if (!routine) {
            return res.status(404).json({ error: "Routine not found" });
          }

          const index = parseInt(dayIndex);
          if (isNaN(index) || index < 0 || index >= routine.routines.length) {
            return res.status(400).json({ error: "Invalid day index" });
          }

          const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
          const blob = bucket.file(uniqueFileName);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: req.file.mimetype },
          });

          blobStream.on("error", (err) => {
            console.error("❌ Firebase upload error:", err);
            return res.status(500).json({ error: "Upload to Firebase failed" });
          });

          blobStream.on("finish", async () => {
            try {
              await blob.makePublic();
            } catch (err) {
              console.error("❌ Failed to make file public:", err);
              return res
                .status(500)
                .json({ error: "Failed to make file public" });
            }

            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            const updatedAssignment = {
              title:
                title || `Class Assignment for ${routine.routines[index].day}`,
              uploadedBy: name,
              facultyEmail: email,
              course: course || routine.routines[index].course,
              url: fileUrl,
              path: uniqueFileName,
              uploadedAt: new Date(),
            };

            const updateResult = await routinesCollection.updateOne(
              { _id: new ObjectId(routineId) },
              {
                $set: {
                  [`routines.${index}.assignment`]: updatedAssignment,
                },
              }
            );

            if (updateResult.modifiedCount > 0) {
              res.status(200).json({
                message: "Assignment updated successfully.",
              });
            } else {
              res.status(500).json({ message: "Failed to update assignment." });
            }
          });

          blobStream.end(req.file.buffer);
        } catch (err) {
          console.error("❌ Error updating assignment:", err);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    );

    // upload student class assignment in routinesCollection
    app.patch(
      "/routine/upload-assignment",
      upload.single("file"),
      async (req, res) => {
        const { routineId, dayIndex, email, name, course, title } = req.body;

        if (!req.file || !req.file.buffer) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        if (!ObjectId.isValid(routineId)) {
          return res.status(400).json({ error: "Invalid routine ID" });
        }

        try {
          const routine = await routinesCollection.findOne({
            _id: new ObjectId(routineId),
          });

          if (!routine) {
            return res.status(404).json({ error: "Routine not found" });
          }

          const index = parseInt(dayIndex);
          if (isNaN(index) || index < 0 || index >= routine.routines.length) {
            return res.status(400).json({ error: "Invalid day index" });
          }

          const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
          const blob = bucket.file(uniqueFileName);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: req.file.mimetype },
          });

          blobStream.on("error", (err) => {
            console.error("❌ Firebase upload error:", err);
            return res.status(500).json({ error: "Upload to Firebase failed" });
          });

          blobStream.on("finish", async () => {
            try {
              await blob.makePublic();
            } catch (err) {
              console.error("❌ Failed to make file public:", err);
              return res
                .status(500)
                .json({ error: "Failed to make file public" });
            }

            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            const assignment = {
              title:
                title || `Class Assignment for ${routine.routines[index].day}`,
              uploadedBy: email,
              course: course || routine.routines[index].course || "",
              url: fileUrl,
              path: uniqueFileName,
              uploadedAt: new Date(),
            };

            const updateResult = await routinesCollection.updateOne(
              { _id: new ObjectId(routineId) },
              {
                $set: {
                  [`routines.${index}.assignment`]: assignment,
                },
              }
            );

            if (updateResult.modifiedCount > 0) {
              res.status(200).json({
                message: "Assignment uploaded successfully.",
              });
            } else {
              res.status(500).json({
                message: "Failed to upload assignment.",
              });
            }
          });

          blobStream.end(req.file.buffer);
        } catch (err) {
          console.error("❌ Error uploading assignment:", err);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    );

    //✅ ✅ ✅  payment routes

    // Create PaymentIntent API
    app.post("/create-payment-intent", verifyToken, async (req, res) => {
      const { amount } = req.body;

      // 🔐 Only allow students to create payment intents
      if (req.user.role !== "student") {
        return res
          .status(403)
          .send({ error: "Forbidden: Only students can make payments" });
      }

      if (!amount) {
        return res.status(400).send({ error: "Amount is required" });
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: parseInt(amount) * 100, // Convert dollars to cents
          currency: "usd",
          automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Stripe Error:", error);
        }
        res.status(500).send({ error: error.message });
      }
    });

    // Save payment information and ✅  save notification
    app.post("/payments", verifyToken, async (req, res) => {
      const payment = req.body;

      // 🔐 Ensure only the logged-in student can submit their own payment
      if (req.user.role !== "student" || req.user.email !== payment.userEmail) {
        return res.status(403).send({
          error: "Forbidden: Students can only submit their own payment",
        });
      }

      if (!payment.transactionId || !payment.amount || !payment.userEmail) {
        return res
          .status(400)
          .send({ error: "Missing required payment fields." });
      }

      try {
        payment.date = new Date(); // store server time
        const result = await paymentsCollection.insertOne(payment);

        // ✅ Create a notification for admin
        const notification = {
          type: "payment",
          email: payment.userEmail,
          applicationDate: new Date(),
          message: `💳 Payment received: $${payment.amount} from ${payment.userEmail}`,
          transactionId: payment.transactionId,
          seen: false,
        };

        await notificationCollection.insertOne(notification);

        res.send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to save payment:", error);
        }
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // ✅ GET: Payment history for specific student by email
    app.get("/payments/:email", verifyToken, async (req, res) => {
      const { email } = req.params;

      // 🔐 Allow only the student to view their own payment history
      if (req.user.role !== "student" || req.user.email !== email) {
        return res
          .status(403)
          .send({ error: "Forbidden: Access denied to payment history" });
      }

      if (!email) {
        return res.status(400).send({ error: "Student email is required" });
      }

      try {
        const payments = await paymentsCollection
          .find({ userEmail: email })
          .sort({ date: -1 })
          .toArray();

        res.send(payments);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Error fetching payment history:", error);
        }
        res.status(500).send({ error: "Failed to fetch payments" });
      }
    });

    // authorization and authentication
    // 🔵 Issue JWT and Set Cookie
    app.post("/jwt", async (req, res) => {
      const { email } = req.body;

      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      try {
        const user = await usersCollection.findOne({ email });

        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        const payload = {
          email: user.email,
          role: user.role || "user",
          name: user.name || "",
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        // for production
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        // for dev....
        // res
        //   .cookie("token", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production" ? true : false,
        //     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        //     maxAge: 24 * 60 * 60 * 1000,
        //   })

          .send({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error generating token" });
      }
    });

    // clean token
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .send({ success: true, message: "Logged out successfully!" });
    });

    //✅ ✅ ✅  nodemailer routes
    // email post route
    app.post("/send-email", async (req, res) => {
      const { name, phone, message, email } = req.body;

      // Basic validation
      if (!name?.trim() || !phone?.trim() || !message?.trim()) {
        return res.status(400).json({
          success: false,
          error: "All fields (name, phone, message) are required.",
        });
      }

      // Optional: Validate email format (if needed in future)
      // const isEmailValid = /\S+@\S+\.\S+/.test(email);

      try {
        // Create transport using Gmail SMTP
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Construct the email content
        const mailOptions = {
          from: `"Contact Form" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
          subject: "📬 New Contact Form Submission",
          html: `
        <h2>New Contact Message Received</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f4f4f4;padding:10px;border-radius:5px;">${message}</p>
        <br />
        <small style="color:gray;">Sent from your website contact form</small>
      `,
        };
        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
          success: true,
          message: "✅ Message sent successfully. We’ll contact you soon.",
        });
      } catch (error) {
        console.error("❌ Email sending failed:", error);
        return res.status(500).json({
          success: false,
          error: "Internal server error. Please try again later.",
        });
      }
    });

    // sending mail function for the classes
    cron.schedule("0 19 * * *", async () => {
      console.log("📬 Starting daily class schedule email job...");

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = tomorrow.toLocaleDateString("en-US", {
        weekday: "long",
      });

      try {
        const students = await studentsCollection.find().toArray();

        for (const student of students) {
          const routines = await routinesCollection
            .find({
              department: student.department,
              "routines.day": tomorrowDay,
            })
            .toArray();

          let scheduleItems = [];

          for (const routine of routines) {
            for (const r of routine.routines) {
              if (
                r.day === tomorrowDay &&
                Array.isArray(r.studentEmails) &&
                r.studentEmails.includes(student.email)
              ) {
                scheduleItems.push(`<li>${r.course} at ${r.time}</li>`);
              }
            }
          }

          if (scheduleItems.length > 0) {
            const htmlList = scheduleItems.join("");
            await sendScheduleEmail(student.email, student.name, htmlList);
          }
        }

        console.log("✅ Class reminder emails sent.");
      } catch (error) {
        console.error("❌ Failed to send class schedule emails:", error);
      }
    });

    app.get("/test-schedule-email/:email", async (req, res) => {
      const { email } = req.params;

      try {
        const student = await studentsCollection.findOne({ email });

        if (!student) {
          return res.status(404).send("Student not found.");
        }

        // Get tomorrow's weekday name
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = tomorrow.toLocaleDateString("en-US", {
          weekday: "long",
        });

        // Find routines that match the student's department and tomorrow's day
        const routines = await routinesCollection
          .find({
            department: student.department,
            "routines.day": tomorrowDay,
          })
          .toArray();

        let scheduleItems = [];

        routines.forEach((routine) => {
          routine.routines
            .filter((r) => r.day === tomorrowDay)
            .forEach((r) => {
              scheduleItems.push(
                `<li><strong>${r.course}</strong> at ${r.time}</li>`
              );
            });
        });

        if (scheduleItems.length > 0) {
          const htmlList = scheduleItems.join("");
          await sendScheduleEmail(student.email, student.name, htmlList);
          return res.send("✅ Test schedule email sent!");
        } else {
          return res.send("ℹ️ No classes scheduled for tomorrow.");
        }
      } catch (err) {
        console.error("❌ Failed to send test email:", err);
        return res.status(500).send("Error sending test email.");
      }
    });

    // await client.db("admin").command({ ping: 1 });

    if (process.env.NODE_ENV === "development") {
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    }
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Students Management");
});

server.listen(port, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`🚀 Server running on http://localhost:${port}`);
  }
});
