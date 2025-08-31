# Revenue Leakage System - MongoDB Backend

## 🚀 **Migration Complete: SQLite → MongoDB**

The backend has been successfully migrated from SQLite to MongoDB for better scalability, performance, and flexibility.

## 📋 **What Changed**

### **Database Layer**
- ❌ **Removed**: SQLite database (`revenue_system.db`)
- ✅ **Added**: MongoDB collections with proper indexing
- 🔄 **Updated**: All CRUD operations to use MongoDB operations

### **New Dependencies**
- `pymongo` - MongoDB Python driver
- `python-dotenv` - Environment variable management
- `dnspython` - DNS resolution for MongoDB connections

### **Data Structure**
- **Collections**: `users`, `datasets`, `leakages`, `tickets`
- **Indexing**: Username uniqueness, proper sorting
- **Aggregation**: MongoDB aggregation pipelines for complex queries

## 🛠️ **Setup Instructions**

### **1. Install MongoDB**

#### **Option A: Local Installation**
```bash
# Windows (using Chocolatey)
choco install mongodb

# macOS (using Homebrew)
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
```

#### **Option B: Docker (Recommended)**
```bash
# Pull and run MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or with persistent storage
docker run -d -p 27017:27017 -v mongodb_data:/data/db --name mongodb mongo:latest
```

### **2. Install Python Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

### **3. Configure Environment (Optional)**
Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/
DB_NAME=revenue_leakage_system
FLASK_ENV=development
FLASK_DEBUG=true
```

### **4. Run the Backend**
```bash
python run.py
```

## 🗄️ **MongoDB Collections**

### **Users Collection**
```json
{
  "_id": "ObjectId",
  "username": "string (unique)",
  "password_hash": "string",
  "role": "admin|finance|it",
  "name": "string",
  "created_at": "datetime"
}
```

### **Datasets Collection**
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

### **Leakages Collection**
```json
{
  "_id": "ObjectId",
  "dataset_id": "ObjectId",
  "sector": "string",
  "severity": "critical|high|medium|low",
  "cause": "string",
  "root_cause": "string",
  "amount": "number",
  "status": "detected|ticket-generated|resolved",
  "detected_at": "datetime"
}
```

### **Tickets Collection**
```json
{
  "_id": "ObjectId",
  "id": "string (T001, T002, etc.)",
  "leakage_id": "ObjectId",
  "assigned_to": "string",
  "status": "open|resolved",
  "priority": "string",
  "title": "string",
  "description": "string",
  "root_cause": "string",
  "ai_suggestions": ["string"],
  "resolution_method": "ai|manual",
  "created_at": "datetime",
  "resolved_at": "datetime"
}
```

## 🔧 **MongoDB Operations Used**

### **CRUD Operations**
- `insert_one()` - Create single documents
- `insert_many()` - Create multiple documents
- `find_one()` - Retrieve single document
- `find()` - Retrieve multiple documents
- `update_one()` - Update single document
- `count_documents()` - Count documents

### **Aggregation Pipeline**
- `$lookup` - Join collections
- `$unwind` - Deconstruct arrays
- `$project` - Select fields
- `$group` - Group and aggregate
- `$sort` - Sort results

### **Indexing**
- Unique index on username
- Automatic indexing on `_id`
- Compound indexes for performance

## 📊 **Performance Improvements**

### **Before (SQLite)**
- Single-file database
- Limited concurrent access
- No built-in scaling
- Manual JOIN operations

### **After (MongoDB)**
- Document-based storage
- High concurrent access
- Horizontal scaling capability
- Native aggregation pipelines
- Better memory management

## 🔍 **API Compatibility**

✅ **All existing API endpoints remain unchanged**
✅ **Same request/response formats**
✅ **Same authentication flow**
✅ **Same business logic**

## 🚨 **Troubleshooting**

### **MongoDB Connection Issues**
```bash
# Check if MongoDB is running
mongo --eval "db.runCommand('ping')"

# Check connection string
echo $MONGO_URI
```

### **Permission Issues**
```bash
# Ensure MongoDB is accessible
sudo systemctl status mongod
sudo systemctl start mongod
```

### **Python Dependencies**
```bash
# Reinstall dependencies
pip uninstall pymongo python-dotenv
pip install -r requirements.txt
```

## 🌟 **Benefits of MongoDB Migration**

1. **Scalability**: Handle larger datasets and concurrent users
2. **Flexibility**: Schema-less document storage
3. **Performance**: Better query performance with aggregation
4. **Scalability**: Horizontal scaling capabilities
5. **Modern**: Industry-standard NoSQL database
6. **Cloud Ready**: Easy deployment to cloud platforms

## 📚 **Additional Resources**

- [MongoDB Documentation](https://docs.mongodb.com/)
- [PyMongo Tutorial](https://pymongo.readthedocs.io/en/stable/tutorial.html)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation/)

---

**Migration completed successfully! 🎉**

The backend now uses MongoDB while maintaining full API compatibility with your existing frontend.
