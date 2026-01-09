// index.js (Your Node.js Server)

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// --- 1. INITIALIZE FIREBASE ADMIN ---
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create a reference to your Firestore database
const db = admin.firestore();

// --- 2. SET UP THE EXPRESS APP ---
const app = express();
app.use(cors()); // Allow requests from your React app
app.use(express.json()); // Parse JSON request bodies

// --- 3. THE AUTHENTICATION MIDDLEWARE ---
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized: No token provided.");
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized: Invalid token.");
  }
};

// --- 4. DEFINE YOUR API ROUTES ---

// A simple "test" route
app.get("/api/test", (req, res) => {
  res.send("Hello from your secure Node.js server!");
});

// GET: The logged-in user's profile
app.get("/api/my-profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send("User profile not found.");
    }
    res.status(200).json(userDoc.data());
  } catch (error) {
    res.status(500).send("Error fetching profile.");
  }
});

// GET: The logged-in user's appointments
app.get("/api/my-appointments", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db
      .collection("appointments")
      .where("patientId", "==", userId)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]); // Send empty array, not an error
    }

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments: ", error);
    res.status(500).send("Error fetching appointments");
  }
});

// ⭐️ REPLACE YOUR ROUTE WITH THIS ⭐️

app.post("/api/book-appointment", verifyToken, async (req, res) => {
  try {
    // 1. Log the incoming data to the console (for debugging)
    console.log("Received new booking data:", req.body);

    const patientId = req.user.uid;
    const { doctorId, doctorName, appointmentDate, appointmentTime, reason } =
      req.body;

    // 2. Check for all required fields
    if (!doctorId || !doctorName || !appointmentDate || !appointmentTime) {
      console.error("Validation failed: Missing data", req.body);
      return res.status(400).send("Missing required booking information.");
    }

    // 3. Combine date and time into a valid Date object
    const dateTimeString = `${appointmentDate}T${appointmentTime}`; // e.g., "2025-10-30T14:30"
    const appointmentDateObj = new Date(dateTimeString);

    // 4. Check if the date is valid
    if (isNaN(appointmentDateObj.getTime())) {
      // Use .getTime() for a robust check
      console.error("Validation failed: Invalid date string", dateTimeString);
      return res.status(400).send("Invalid date or time format.");
    }

    // 5. Save to Firestore
    const appointmentRef = await db.collection("appointments").add({
      patientId: patientId,
      doctorId: doctorId,
      doctorName: doctorName,
      reason: reason || "",

      // 6. Convert the valid Date object to a Firestore Timestamp
      appointmentTime: admin.firestore.Timestamp.fromDate(appointmentDateObj),

      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      id: appointmentRef.id,
      message: "Appointment created successfully",
    });
  } catch (error) {
    console.error("Error creating appointment (in catch block):", error);
    res.status(500).send("Error creating appointment");
  }
});

// ADD THIS NEW ROUTE for handling cancellations
app.delete("/api/appointment/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const appointmentId = req.params.id;

    const docRef = db.collection("appointments").doc(appointmentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send("Appointment not found.");
    }

    const appointment = doc.data();

    // 1. Security Check: Is this user the owner of the appointment?
    if (appointment.patientId !== userId) {
      return res
        .status(403)
        .send("Forbidden: You cannot cancel this appointment.");
    }

    // 2. Logical Constraint: Is the appointment in the past?
    const now = admin.firestore.Timestamp.now();
    if (appointment.appointmentTime < now) {
      return res
        .status(400)
        .send("You cannot cancel an appointment that is already in the past.");
    }

    // All checks passed! Delete the document.
    await docRef.delete();
    res.status(200).send("Appointment canceled successfully.");
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).send("Error canceling appointment.");
  }
});
// --- 5. START THE SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
