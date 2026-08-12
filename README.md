# SIDIAS: AI and Computer Vision-Based Child Stunting Diagnosis System for Integrated Nutritional Management

**Capstone Theme:** Healthy Lives & Well-being
**Capstone Project Team ID:** CC26-PSU020

## 👥 Our Team

| Participant ID | Name                    | Role         | Status |
| -------------- | ----------------------- | ------------ | ------ |
| CFCC438D6Y1813 | Fairuz Istighfar        | Full Stack   | Active |
| CFCC482D6X1288 | Dela Deliansyah         | Full Stack   | Active |
| CDCC482D6Y0599 | Egi Julian              | Data Science | Active |
| CDCC319D6X1000 | Dini Arya Putri         | Data Science | Active |
| CACC482D6Y2469 | Mohammad Bisri Musthafa | AI Engineer  | Active |
| CACC404D6X0172 | Elisabeth Margaretta    | AI Engineer  | Active |

---

## SIDIAS Overview

**SIDIAS** is a multimodal **Artificial Intelligence (AI)**-based platform designed to detect and predict the potential risk of stunting in young children at an early stage, quickly, and accurately. The platform combines anthropometric clinical data analysis with visual analysis of children's physical characteristics to provide a comprehensive screening approach for parents, community health workers, and medical professionals.

---

## 🚀 Key Features & Multimodal AI Approach

SIDIAS uses an **Ensemble Model Architecture** to process two different types of data modalities (**Multimodal Dataset**):

* **Tabular Stunting Detection (Clinical Data):** Predicts the child's stunting status using the **Random Forest Classifier** based on anthropometric data such as Age, Gender, Height, and Weight, along with engineered clinical features such as **Body Mass Index (BMI)** and **Height-for-Age Ratio**. Class imbalance in the dataset is addressed using the **SMOTE** technique.
* **Visual Stunting Detection (Image Data):** Analyzes the external physical characteristics of young children from uploaded photos using the **MobileNetV2** deep learning architecture, which is efficient and suitable for deployment in web/mobile environments.

---

## 🛠️ System Workflow (Data Pipeline & Integration)

1. **Form Input & Capture:** Users enter the child's anthropometric data and upload a photo of the child's physical appearance through the web interface.
2. **Preprocessing & Feature Engineering (Tabular):** The system automatically calculates clinical values such as BMI and Height-for-Age Ratio based on the raw input data.
3. **Data Standardization:** The tabular data is standardized using the `StandardScaler` component (`scaler.pkl`) into decimal **Z-Score** format before being processed by the model.
4. **AI Dual Inference:**

   * Clinical data is processed using `random_forest_stunting_model.pkl`.
   * The child's photo is processed using the **MobileNetV2** model (`.h5` / SavedModel).
5. **Ensemble Output:** The system combines the prediction results from both models to produce the final stunting diagnosis along with the AI confidence level (probability).

---

## 💻 Project Tech Stack

The application architecture is built using a modern technology ecosystem divided into three main components:

* **Front-End:** React.js, Vite, and TailwindCSS — providing a responsive, fast, and user-friendly interface.
* **Back-End:** Node.js, Express.js, and PostgreSQL — serving as the backend system and relational database for storing child screening and diagnosis history.
* **AI Component:** Python, Scikit-Learn (Random Forest & Preprocessing), TensorFlow/Keras (MobileNetV2), Pandas, and Joblib.

---

## 🛠️ Installation Prerequisites

Before starting the installation, make sure the following software is installed on your computer:

* **Docker** & **Docker Compose** (Docker Desktop is recommended for Windows/macOS, or Docker Engine for Linux)
* **Git** (for cloning the source code repository)

---

## 🚀 Installation & Running the Application with Docker

By using Docker, you do not need to manually install Node.js, Python, PostgreSQL, or the required AI libraries on your computer. All environments and dependencies are automatically containerized.

### 1. Clone the Repository & Navigate to the Full-Stack Folder

If you have not cloned the repository yet, run the following commands in your terminal:

```bash
git clone https://github.com/EgiJulian12/SIDIAS-.git
cd SIDIAS-/Full-Stack
```

### 2. Run the Application (Using Pre-Built Images)

To simplify deployment on another PC without building the application from scratch, run the following command inside the `Full-Stack/` folder:

```bash
docker compose up -d
```

This command will automatically pull the PostgreSQL, Backend, and Frontend images from Docker Hub, initialize the database schema, and start the application.

To verify that all containers are running properly, run:

```bash
docker compose ps
```

### 3. Stop the Application

To stop all application services, run:

```bash
docker compose down
```

---

## ⚙️ Rebuild Local Images (For Developers)

If you make changes to the Front-End or Back-End source code and need to rebuild the Docker images locally, follow these steps:

1. **Build the Local Images:**

   ```bash
   docker compose -f docker-compose.build.yml build
   ```

2. **Run the Locally Built Images:**

   ```bash
   docker compose -f docker-compose.build.yml up -d
   ```

---

## 🔑 Default Admin Login Credentials

When the PostgreSQL database is initialized for the first time, the backend automatically creates a default administrator account:

* **NIK:** `admin`
* **Password:** `admin123`

---

## 🌐 Application Access

https://sidias-flame.vercel.app

---

## 🤖 AI Model Link

**Google Drive:**
https://drive.google.com/drive/folders/1ek88NugRZs3cUxqjJrG51oiQaKO582MK
