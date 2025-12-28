# 🏥 AlgoMed – AI-Powered Telemedicine Platform

AlgoMed is a **full-stack MERN-based telemedicine web application** designed to bridge the gap between patients and doctors through secure digital healthcare services.
It enables **online consultations, appointment management, real-time communication**, and **AI-assisted healthcare support** in a modern SaaS-style interface.

---

## 🚀 Features

### 👤 User Management

* Patient & Doctor role-based authentication
* Secure JWT-based login & signup
* Profile creation and management

### 🩺 Doctor Dashboard

* Manage availability & appointments
* View patient history
* Professional profile with qualifications, experience & fees

### 🧑‍⚕️ Patient Dashboard

* Book appointments with doctors
* View upcoming & past consultations
* Health insights and appointment status tracking

### 💬 Communication

* Real-time chat between doctor and patient
* Planned support for video consultations (WebRTC-ready)

### 🤖 AI Assistance

* AI-powered health assistant for guidance and support
* Designed for future symptom analysis & report summarization

### 🔐 Security

* Role-based access control
* Protected routes
* Secure password hashing

---

## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](./screenshots/landing.png)

### 🔐 Authentication (Login / Signup)
![Auth Page](./screenshots/auth1.png)
![Auth Page](./screenshots/auth2.png)

### 🧑‍⚕️ Doctor Dashboard
![Doctor Dashboard](./screenshots/doctor-dashboard1.png)
![Doctor Dashboard](./screenshots/doctor-dashboard2.png)

### 🧑‍⚕️ Patient Dashboard
![Patient Dashboard](./screenshots/patient-dashboard.png)

### 📅 Appointment Management
![Appointments](./screenshots/appointments.png)

### 💬 Real-Time Chat
![Chat](./screenshots/chat.png)

### 💬 AlgoMed AI
![Chat](./screenshots/ai.png)

------

## 🛠 Tech Stack

### Frontend

* React.js
* Vite
* Bootstrap / Custom CSS
* React Icons
* Recharts (Health Analytics)

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Bcrypt.js

### Database

* MongoDB Atlas

---

## 📁 Project Structure

```
AlgoMed-MERN/
│
├── Backend/
│   ├── config/            # DB configuration
│   ├── controllers/       # API logic
│   ├── middleware/        # Auth & role guards
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   └── server.js
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── main.jsx
│   └── index.html
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/krishnna05/AlgoMed.git
cd AlgoMed
```

---

### 2️⃣ Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd ../Frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

Backend runs at:

```
http://localhost:5000
```

---

## 🔒 API Authentication Flow

* JWT stored in localStorage
* Auth middleware verifies token
* Role middleware restricts doctor/patient routes

---

## 📌 Future Enhancements

* Video consultation using WebRTC
* Online payment gateway
* AI-based symptom checker
* Medical report upload & analysis
* Prescription management
* Push notifications

---

## 🤝 Contributing

Contributions are welcome!
Fork the repository, create a feature branch, and submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Krishna Vishwakarma**
Full Stack Developer | MERN | AI in Healthcare
🔗 GitHub: [https://github.com/krishnna05](https://github.com/krishnna05)

