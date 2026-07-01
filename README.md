<div align="center">
  <img src="public/favicon.svg" alt="CA Saathi Logo" width="80" />
  <h1>CA Saathi</h1>
  <p><strong>A Modern Practice Management Solution for Chartered Accountants</strong></p>
</div>

---

## 📌 About The Project

**CA Saathi** is a comprehensive, full-stack practice management application built exclusively for Chartered Accountants and Tax Professionals in India. It streamlines workflow by providing a central dashboard to track clients, manage statutory deadlines (GST, TDS, Income Tax), monitor pending documents, and send automated client reminders via Email and SMS.

Built with a focus on premium UI/UX, the application features smooth micro-animations, a clean aesthetic, and a robust real-time backend.

### 🌟 Key Features

*   **📊 Smart Dashboard**: A bird's eye view of your entire firm. Instantly see pending documents, total active clients, upcoming deadlines, and recent reminder statistics.
*   **👥 Client Management**: Easily add, edit, and manage your clients' business profiles, contact details, and associated documents in one centralized secure location.
*   **📅 Deadline Tracker**: Automatically calculates the status of statutory deadlines (Overdue, Due Soon, Safe). Never miss a GST or Income Tax filing date again.
*   **🔔 Automated Reminders**: One-click reminder system integrated with **Brevo API**. Instantly send automated, professional Emails and SMS texts to clients regarding missing documents or upcoming dues.
*   **🗂️ Document Tracking**: Track which documents (Bank Statements, Purchase Reports, GST Bills) are pending or received for each individual client.
*   **🔐 Secure Authentication**: Full JWT-based authentication system to ensure your firm's data remains strictly confidential.

---

## 🛠️ Tech Stack

### Frontend
*   **React 19** (Vite)
*   **React Router v7**
*   **Framer Motion & GSAP** (For smooth micro-animations and page transitions)
*   **Lucide React** (Beautiful, consistent iconography)
*   **Vanilla CSS** (Custom, scalable design system using CSS Variables)

### Backend & Infrastructure
*   **Node.js & Express.js**
*   **MongoDB Atlas** (Cloud Database via Mongoose)
*   **JSON Web Tokens (JWT)** (Stateless Authentication)
*   **Brevo API** (For Transactional Email and SMS delivery)
*   **Vercel** (Ready for Serverless Deployment)

---

## 🚀 Getting Started Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or higher)
*   MongoDB Atlas Account (or local MongoDB server)
*   Brevo Account (for sending emails/SMS)

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/your-username/casaathi.git
   ```
2. **Install Frontend Dependencies**
   ```sh
   npm install
   ```
3. **Install Backend Dependencies**
   ```sh
   cd server
   npm install
   ```
4. **Setup Environment Variables**
   Create a `.env` file inside the `server/` directory and add your keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   BREVO_API_KEY=your_brevo_api_key
   ```
5. **Run the Application (Development Mode)**
   Open two terminals.
   
   Terminal 1 (Backend):
   ```sh
   cd server
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```sh
   npm run dev
   ```

---

## ☁️ Deployment

This project is configured out-of-the-box for **Vercel**.
The included `vercel.json` automatically handles routing the React frontend to `@vercel/static-build` and the Express backend to `@vercel/node`. Simply import the repository into Vercel and add your environment variables!

---

*Designed and engineered with ❤️ for Indian CAs.*
