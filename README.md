# 🚀 Banking Regulatory Complaince Platform

## 📌 Table of Contents
- [Introduction](#introduction)
- [Demo](#demo)
- [Inspiration](#inspiration)
- [What It Does](#what-it-does)
- [How We Built It](#how-we-built-it)
- [Challenges We Faced](#challenges-we-faced)
- [How to Run](#how-to-run)
- [Tech Stack](#tech-stack)
- [Team](#team)

---

## 🎯 Introduction
The **Banking Regulatory Compliance Platform** is an AI-powered solution designed to streamline regulatory compliance for financial institutions. It automates document analysis, rule extraction, validation, and transaction data profiling to ensure adherence to banking regulations such as KYC (Know Your Customer) and AML (Anti-Money Laundering). This project addresses the problem of time-consuming manual compliance processes by leveraging modern web technologies and AI.
## 🎥 Demo
### 📹 [Video Demo]
#### https://drive.google.com/file/d/1DO-Uj6YmKLjXbRI6ugxNdlBsdvWhHYEg/view?usp=sharing

## 🖼️ Screenshots:
### **Solution 1**
![Home](https://github.com/user-attachments/assets/9f0b0904-b97d-44a8-8570-d00ed66dccde)

![RuleValidation](https://github.com/user-attachments/assets/e68f8e51-7a93-4323-8be1-4e94168d9f19)

![Data Profiling](https://github.com/user-attachments/assets/e441fab0-2a14-48bb-afb3-65d937fe60b7)

### **Solution 2**
![VS CODE Extension](https://github.com/user-attachments/assets/bb1e48d1-1b97-4278-b602-161f29b99f23)




## 💡 Inspiration
The inspiration for this project stemmed from the increasing regulatory pressures faced by banks and financial institutions. Manual compliance processes are error-prone, costly, and slow. We aimed to create a tool that simplifies these workflows, reduces human error, and provides actionable insights using AI-driven automation.

## ⚙️ What It Does
- **Document Upload:** Allows users to upload regulatory documents (PDF, Word, TXT) for automated analysis.  
- **Rule Validation:** Extracts rules from documents, enables multi-modal cross-validation, and lets users mark rules as validated or pending.  
- **Data Profiling:** Processes transaction data (CSV) to assess compliance risks, categorize transactions (e.g., high-risk, medium-risk, compliant), and provide detailed summaries.  
- **User-Friendly Interface:** Offers intuitive filtering, searching, and visualization of compliance data.

## 🛠️ How We Built It
We developed a full-stack web application using Next.js for seamless client-side rendering and server-side capabilities. The frontend leverages reusable UI components from a custom library (\`@/components/ui\`), while the backend handles file uploads and rule processing via RESTful APIs. The platform integrates with an AI backend (assumed at \`localhost:3001\`) for document parsing and compliance analysis.  

## 🚧 Challenges We Faced
- **File Upload Handling:** Ensuring robust handling of various file types (CSV, PDF, etc.) and managing large uploads without performance degradation.  
- **Dynamic Filtering:** Implementing real-time filtering for rules and transaction data with multiple criteria (e.g., risk level, category).  
- **UI Responsiveness:** Balancing a feature-rich interface with smooth animations and responsive design across devices.  
- **API Integration:** Coordinating frontend interactions with a backend API for seamless data flow and error handling.

## 🏃 How to Run Frontend 
1. **Clone the Repository**  
   ```sh
   git clone https://github.com/your-repo.git
   ```
2. **Install Dependencies**  
   ```sh
   cd code/Gen AI/frontend
   pnpm install
   ```
3. **Run the Backend (Assumed)**
    ```sh
   pnpm dev
   ```
   Ensure a backend server is running at `http://localhost:3001`.
  
## 🏃 How to Run Frontend 
1. **Install Dependencies**  
   ```sh
   cd code/Gen AI/backend
   npm install
   ```
2. **Run the Backend (Assumed)**
    ```sh
   node server.js
   ```
   Ensure a backend server is running at `http://localhost:3003`. 
  


## 🏗️ Tech Stack
- **Frontend:** Next.js (React), TypeScript, Tailwind CSS  
- **UI Components:** Custom library (\`@/components/ui\`) with Button, Card, Input, Tabs, etc.  
- **Backend:** Node.js (assumed, based on API endpoints like \`/api/upload-data\`)  
- **APIs:** RESTful endpoints for file uploads and rule management  
- **Other:** Lucide React (icons), Dynamic Imports for performance optimization

[## 👥 Team
- **Maheshwari Kalichamy** - [github](mahe-kalichamy) | [LinkedIn]([#](https://www.linkedin.com/in/maheshwari-kalichamy-3495aa251))
- **Karthik Dupakuntla** - [LinkedIn]([#](https://www.linkedin.com/in/karthik-dupakuntla-1b638b11/))
- **Sudarssan N** - [github](sudarssan-n) | [LinkedIn]([#](https://in.linkedin.com/in/sudarssan-n-a7aaa91bb))
-  **Naveen Venugopal** - [github](naveen-2003-glitch) | [LinkedIn]([#](https://in.linkedin.com/in/naveen-venugopal-1225151bb))]
