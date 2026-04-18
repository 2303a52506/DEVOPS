const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = process.env.PORT || 5000;

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://2303a52506_db_user:admin123@cluster0.ogkdufq.mongodb.net/medipulse?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// ==================== SCHEMAS ====================

const patientSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    experience: { type: String, default: "5 years", trim: true },
    fee: { type: Number, default: 500 },
    available: { type: Boolean, default: true },
    phone: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },
    patientName: { type: String, required: true },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    doctorName: { type: String, required: true },
    disease: { type: String, required: true, trim: true },
    symptoms: { type: String, default: "" },
    medical_history: { type: String, default: "" },
    hospital: { type: String, required: true, trim: true },
    appointment_date: { type: String, required: true },
    appointment_time: { type: String, required: true },
    status: { type: String, default: "Confirmed" }
  },
  { timestamps: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    doctorName: { type: String, required: true },
    medicines: { type: String, required: true },
    notes: { type: String, default: "" },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
const Doctor = mongoose.model("Doctor", doctorSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const Prescription = mongoose.model("Prescription", prescriptionSchema);

// ==================== SEED DATA ====================

async function seedDoctors() {
  try {
    const count = await Doctor.countDocuments();

    if (count === 0) {
      await Doctor.insertMany([
        {
          name: "Dr. Ravi Kumar",
          specialization: "Cardiologist",
          hospital: "Apollo Hospital",
          experience: "12 years",
          fee: 700,
          available: true,
          phone: "9950112345",
          username: "doctor1",
          password: "doc123"
        },
        {
          name: "Dr. Meena Reddy",
          specialization: "Dermatologist",
          hospital: "Care Hospital",
          experience: "9 years",
          fee: 500,
          available: true,
          phone: "9848023456",
          username: "doctor2",
          password: "doc456"
        },
        {
          name: "Dr. John Varma",
          specialization: "Neurologist",
          hospital: "AIIMS Outreach",
          experience: "14 years",
          fee: 900,
          available: true,
          phone: "9848534567",
          username: "doctor3",
          password: "doc789"
        }
      ]);
      console.log("Demo doctors inserted");
    }
  } catch (error) {
    console.error("Doctor seed error:", error.message);
  }
}

async function seedPatients() {
  try {
    const count = await Patient.countDocuments();

    if (count === 0) {
      await Patient.insertMany([
        {
          username: "patient1",
          name: "Kiranmai",
          age: 21,
          gender: "Female",
          phone: "9876543210",
          password: "pass123"
        },
        {
          username: "patient2",
          name: "Shalini",
          age: 22,
          gender: "Female",
          phone: "9123456780",
          password: "pass456"
        }
      ]);
      console.log("Demo patients inserted");
    }
  } catch (error) {
    console.error("Patient seed error:", error.message);
  }
}

mongoose.connection.once("open", async () => {
  await seedDoctors();
  await seedPatients();
});

// ==================== BASIC ====================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MediPulse API running"
  });
});

// ==================== REGISTER ====================

app.post("/register", async (req, res) => {
  try {
    const { username, name, age, gender, phone, password } = req.body;

    if (!username || !name || !age || !gender || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    const existingUser = await Patient.findOne({ username: username.trim() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Username already exists"
      });
    }

    const patient = await Patient.create({
      username: username.trim(),
      name: name.trim(),
      age: Number(age),
      gender: gender.trim(),
      phone: phone.trim(),
      password: password.trim()
    });

    res.json({
      success: true,
      message: "Registration successful",
      patient
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

// ==================== LOGIN ====================

app.post("/login", async (req, res) => {
  try {
    let { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "Username, password and role are required"
      });
    }

    username = String(username).trim();
    password = String(password).trim();
    role = String(role).trim().toLowerCase();

    if (role === "admin") {
      if (username === "admin" && password === "admin") {
        return res.json({
          success: true,
          role: "admin",
          admin: {
            username: "admin",
            name: "Administrator"
          }
        });
      }

      return res.status(401).json({
        success: false,
        error: "Invalid admin credentials"
      });
    }

    if (role === "patient") {
      const patient = await Patient.findOne({ username, password });

      if (!patient) {
        return res.status(401).json({
          success: false,
          error: "Invalid patient credentials"
        });
      }

      return res.json({
        success: true,
        role: "patient",
        patient
      });
    }

    if (role === "doctor") {
      const doctor = await Doctor.findOne({ username, password });

      if (!doctor) {
        return res.status(401).json({
          success: false,
          error: "Invalid doctor credentials"
        });
      }

      return res.json({
        success: true,
        role: "doctor",
        doctor
      });
    }

    return res.status(400).json({
      success: false,
      error: "Invalid role"
    });
  } catch (error) {
    console.error("Login error full:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

// ==================== GET PATIENTS ====================

app.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ name: 1 });
    res.json(patients);
  } catch (error) {
    console.error("Patients fetch error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patients"
    });
  }
});

// ==================== GET DOCTORS ====================

app.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    console.error("Doctors fetch error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch doctors"
    });
  }
});

// ==================== ADD DOCTOR ====================

app.post("/add-doctor", async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      specialization,
      hospital,
      phone,
      experience,
      fee,
      available
    } = req.body;

    if (!name || !username || !password || !specialization || !hospital || !phone) {
      return res.status(400).json({
        success: false,
        error: "Required doctor fields are missing"
      });
    }

    const existingDoctor = await Doctor.findOne({ username: username.trim() });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        error: "Doctor username already exists"
      });
    }

    const doctor = await Doctor.create({
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      specialization: specialization.trim(),
      hospital: hospital.trim(),
      phone: phone.trim(),
      experience: experience ? String(experience).trim() : "5 years",
      fee: fee ? Number(fee) : 500,
      available: available !== undefined ? Boolean(available) : true
    });

    res.json({
      success: true,
      message: "Doctor added successfully",
      doctor
    });
  } catch (error) {
    console.error("Add doctor error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to add doctor"
    });
  }
});

// ==================== BOOK APPOINTMENT ====================

app.post("/book-appointment", async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      disease,
      symptoms,
      medical_history,
      hospital,
      appointment_date,
      appointment_time
    } = req.body;

    if (
      !patient_id ||
      !doctor_id ||
      !disease ||
      !hospital ||
      !appointment_date ||
      !appointment_time
    ) {
      return res.status(400).json({
        success: false,
        error: "Required fields are missing"
      });
    }

    const patient = await Patient.findById(patient_id);
    const doctor = await Doctor.findById(doctor_id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: "Patient not found"
      });
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: "Doctor not found"
      });
    }

    const appointment = await Appointment.create({
      patient_id,
      patientName: patient.name,
      doctor_id,
      doctorName: doctor.name,
      disease,
      symptoms: symptoms || "",
      medical_history: medical_history || "",
      hospital,
      appointment_date,
      appointment_time,
      status: "Confirmed"
    });

    res.json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    console.error("Book appointment error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to book appointment"
    });
  }
});

// ==================== PATIENT APPOINTMENTS ====================

app.get("/appointments/patient/:patientId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient_id: req.params.patientId
    }).sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    console.error("Patient appointments error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patient appointments"
    });
  }
});

// ==================== DOCTOR APPOINTMENTS ====================

app.get("/appointments/doctor/:doctorName", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorName: req.params.doctorName
    }).sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    console.error("Doctor appointments error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch doctor appointments"
    });
  }
});

// ==================== ADD PRESCRIPTION ====================

app.post("/add-prescription", async (req, res) => {
  try {
    const { patientName, doctorName, medicines, notes } = req.body;

    if (!patientName || !doctorName || !medicines) {
      return res.status(400).json({
        success: false,
        error: "Required fields missing"
      });
    }

    const prescription = new Prescription({
      patientName,
      doctorName,
      medicines,
      notes: notes || "",
      date: new Date().toLocaleDateString()
    });

    await prescription.save();

    res.json({
      success: true,
      message: "Prescription added"
    });
  } catch (error) {
    console.error("Prescription save error:", error.message);
    res.status(500).json({
      success: false,
      error: "Error saving prescription"
    });
  }
});

// ==================== PATIENT PRESCRIPTIONS ====================

app.get("/patient-prescriptions/:name", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientName: req.params.name
    }).sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error("Prescription fetch error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch prescriptions"
    });
  }
});

// ==================== PRESCRIPTION PDF ====================

app.get("/prescription-pdf/:id", async (req, res) => {
  try {
    const p = await Prescription.findById(req.params.id);

    if (!p) {
      return res.status(404).send("Prescription not found");
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prescription-${p._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("MediPulse Prescription", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Patient: ${p.patientName}`);
    doc.text(`Doctor: ${p.doctorName}`);
    doc.text(`Date: ${p.date}`);
    doc.moveDown();
    doc.fontSize(14).text("Medicines:");
    doc.fontSize(12).text(p.medicines);
    doc.moveDown();
    doc.fontSize(14).text("Notes:");
    doc.fontSize(12).text(p.notes || "-");
    doc.moveDown();
    doc.text("Doctor Signature:");
    doc.text(`Dr. ${p.doctorName}`);

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error.message);
    res.status(500).send("Error generating PDF");
  }
});

// ==================== ADMIN DATA ====================

app.get("/admin-data", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      patients,
      doctors,
      appointments,
      prescriptions
    });
  } catch (error) {
    console.error("Admin data error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch admin data"
    });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});