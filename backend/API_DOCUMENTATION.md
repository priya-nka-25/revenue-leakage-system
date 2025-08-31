# Revenue Leakage System - Backend API Documentation (MongoDB)

## Base URL
```
http://localhost:5000
```

## 🗄️ **Database: MongoDB**
The system now uses MongoDB for better scalability and performance. All data is stored in collections with proper indexing and aggregation pipelines.

## Authentication
The system uses username/password authentication. No JWT tokens are required for this implementation.

---

## API Endpoints

### 1. Authentication

#### POST /api/auth/login
Authenticate a user with username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- **Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "string (MongoDB ObjectId)",
    "username": "string",
    "role": "string",
    "name": "string"
  }
}
```

- **Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**Default Users:**
- `admin` / `password123` (Admin role)
- `finance` / `password123` (Finance role)
- `it` / `password123` (IT role)

---

### 2. Dataset Management

#### POST /api/datasets/upload
Upload a new dataset for processing.

**Request Body:**
```json
{
  "filename": "string",
  "sector": "string",
  "uploaded_by": "string"
}
```

**Response:**
```json
{
  "success": true,
  "dataset_id": "string (MongoDB ObjectId)",
  "message": "Dataset uploaded successfully"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:5000/api/datasets/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "telecom_data_2024.csv",
    "sector": "telecom",
    "uploaded_by": "admin-001"
  }'
```

#### POST /api/datasets/{dataset_id}/process
Process a dataset to detect revenue leakages using AI.

**Path Parameters:**
- `dataset_id`: The MongoDB ObjectId of the dataset to process

**Response:**
```json
{
  "success": true,
  "leakages_detected": 3,
  "leakages": [
    {
      "sector": "string",
      "severity": "string",
      "cause": "string",
      "root_cause": "string",
      "amount": 25000,
      "status": "detected",
      "detected_at": "datetime"
    }
  ]
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:5000/api/datasets/507f1f77bcf86cd799439011/process
```

---

### 3. Leakage Management

#### GET /api/leakages
Retrieve all detected revenue leakages.

**Response:**
```json
{
  "leakages": [
    {
      "id": "string (MongoDB ObjectId)",
      "dataset_id": "string (MongoDB ObjectId)",
      "sector": "string",
      "severity": "string",
      "cause": "string",
      "root_cause": "string",
      "amount": 25000,
      "status": "string",
      "detected_at": "datetime"
    }
  ]
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:5000/api/leakages
```

#### GET /api/leakages/{leakage_id}/details
Get detailed information about a specific leakage.

**Path Parameters:**
- `leakage_id`: The MongoDB ObjectId of the leakage

**Response:**
```json
{
  "leakage": {
    "id": "string (MongoDB ObjectId)",
    "sector": "string",
    "severity": "string",
    "cause": "string",
    "root_cause": "string",
    "amount": 25000,
    "status": "string",
    "detected_at": "datetime",
    "assigned_department": "string"
  }
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:5000/api/leakages/507f1f77bcf86cd799439011/details
```

---

### 4. Ticket Management

#### POST /api/tickets/generate
Generate a ticket for a detected leakage.

**Request Body:**
```json
{
  "leakage_id": "string (MongoDB ObjectId)"
}
```

**Response:**
```json
{
  "success": true,
  "ticket_id": "string",
  "assigned_to": "string",
  "message": "string"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:5000/api/tickets/generate \
  -H "Content-Type: application/json" \
  -d '{
    "leakage_id": "507f1f77bcf86cd799439011"
  }'
```

#### GET /api/tickets
Retrieve tickets based on user role.

**Query Parameters:**
- `role`: Filter tickets by role (`admin`, `finance`, `it`, `all`)

**Response:**
```json
{
  "tickets": [
    {
      "id": "string",
      "leakage_id": "string (MongoDB ObjectId)",
      "assigned_to": "string",
      "status": "string",
      "priority": "string",
      "title": "string",
      "description": "string",
      "root_cause": "string",
      "ai_suggestions": ["string"],
      "resolution_method": "string",
      "created_at": "datetime",
      "resolved_at": "datetime",
      "sector": "string",
      "amount": 25000
    }
  ]
}
```

**Curl Examples:**
```bash
# Get all tickets (admin)
curl -X GET "http://localhost:5000/api/tickets?role=all"

# Get finance team tickets
curl -X GET "http://localhost:5000/api/tickets?role=finance"

# Get IT team tickets
curl -X GET "http://localhost:5000/api/tickets?role=it"
```

#### POST /api/tickets/{ticket_id}/resolve
Resolve a ticket with either AI or manual resolution.

**Path Parameters:**
- `ticket_id`: The ID of the ticket to resolve

**Request Body:**
```json
{
  "method": "string",  // "ai" or "manual"
  "solutions": ["string"]  // Optional custom solutions for manual resolution
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

**Curl Examples:**
```bash
# Resolve with AI
curl -X POST http://localhost:5000/api/tickets/T001/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "method": "ai"
  }'

# Resolve manually with custom solutions
curl -X POST http://localhost:5000/api/tickets/T001/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "method": "manual",
    "solutions": [
      "Update billing system configuration",
      "Implement automated validation checks"
    ]
  }'
```

---

### 5. Statistics & Analytics

#### GET /api/stats
Get comprehensive system statistics and analytics using MongoDB aggregation pipelines.

**Response:**
```json
{
  "total_leakages": 15,
  "total_tickets": 12,
  "resolved_tickets": 8,
  "pending_tickets": 4,
  "ai_resolutions": 5,
  "manual_resolutions": 3,
  "severity_distribution": {
    "critical": 3,
    "high": 7,
    "medium": 5
  },
  "sector_distribution": {
    "telecom": 6,
    "healthcare": 5,
    "banking": 4
  },
  "revenue_impact_by_sector": {
    "telecom": 150000,
    "healthcare": 200000,
    "banking": 120000
  }
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:5000/api/stats
```

---

## 🗄️ **MongoDB Data Models**

### User Collection
```json
{
  "_id": "ObjectId",
  "username": "string (unique index)",
  "password_hash": "string",
  "role": "admin|finance|it",
  "name": "string",
  "created_at": "datetime"
}
```

### Dataset Collection
```json
{
  "_id": "ObjectId",
  "filename": "string",
  "sector": "telecom|healthcare|banking",
  "uploaded_by": "string",
  "status": "processing|completed",
  "created_at": "datetime"
}
```

### Leakage Collection
```json
{
  "_id": "ObjectId",
  "dataset_id": "ObjectId (reference)",
  "sector": "telecom|healthcare|banking",
  "severity": "critical|high|medium|low",
  "cause": "string",
  "root_cause": "string",
  "amount": "number",
  "status": "detected|ticket-generated|resolved",
  "detected_at": "datetime"
}
```

### Ticket Collection
```json
{
  "_id": "ObjectId",
  "id": "string (T001, T002, etc.)",
  "leakage_id": "ObjectId (reference)",
  "assigned_to": "string",
  "status": "open|resolved",
  "priority": "critical|high|medium|low",
  "title": "string",
  "description": "string",
  "root_cause": "string",
  "ai_suggestions": ["string"],
  "resolution_method": "ai|manual",
  "created_at": "datetime",
  "resolved_at": "datetime"
}
```

---

## 🔧 **MongoDB Features Used**

### **Aggregation Pipelines**
- **$lookup**: Join leakages with tickets for comprehensive data
- **$unwind**: Deconstruct arrays for processing
- **$project**: Select specific fields for response
- **$group**: Aggregate data for statistics
- **$sort**: Sort results by creation date

### **Indexing Strategy**
- **Unique Index**: Username field for authentication
- **Automatic Indexing**: `_id` field for fast lookups
- **Compound Indexes**: For complex queries and sorting

### **CRUD Operations**
- **Create**: `insert_one()`, `insert_many()`
- **Read**: `find_one()`, `find()`, `aggregate()`
- **Update**: `update_one()` with `$set` operator
- **Delete**: Not implemented (soft deletes via status)

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found
- **500**: Internal Server Error (including MongoDB connection issues)

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🚀 **AI Processing Pipeline**

The system simulates an AI processing pipeline for dataset analysis:

1. **Dataset Chunking**: Breaks down large datasets into manageable chunks
2. **Embedding Generation**: Creates vector representations of data chunks
3. **Leakage Detection**: Uses AI models to identify potential revenue leakages
4. **Suggestion Generation**: Provides AI-powered resolution suggestions

---

## 🌍 **Supported Sectors**

- **Telecom**: Mobile billing, roaming charges, data usage
- **Healthcare**: Insurance claims, prescription billing, patient copays
- **Banking**: Foreign exchange, transaction fees, interest calculations

---

## 🛠️ **Running the MongoDB Backend**

### **1. Install MongoDB**
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
# Windows: choco install mongodb
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
```

### **2. Install Python Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

### **3. Run the Application**
```bash
python run.py
```

The server will start on `http://localhost:5000` with CORS enabled for frontend integration.

---

## 🔍 **MongoDB Connection Status**

The backend automatically checks MongoDB connectivity and provides status feedback:
- ✅ **Connected**: MongoDB accessible and ready
- ❌ **Connection Failed**: Check MongoDB installation and status
- 🔄 **Initializing**: Setting up collections and default data

---

**🎉 MongoDB Backend Ready!**

Your Revenue Leakage System now uses MongoDB for enhanced performance, scalability, and modern database features while maintaining full API compatibility.
