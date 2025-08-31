#!/usr/bin/env python3
"""
Revenue Leakage Detection System Backend (MongoDB)
Run this script to start the Flask development server
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, init_db
from config import Config

if __name__ == '__main__':
    print("🚀 Starting Revenue Leakage Detection System Backend (MongoDB)...")
    print(f"📊 MongoDB URI: {Config.MONGO_URI}")
    print(f"🗄️  Database: {Config.DB_NAME}")
    print("📊 Initializing database...")
    
    try:
        init_db()
        print("✅ Database initialized successfully!")
        print("🌐 Starting Flask server on http://localhost:5000")
        print("📝 API Documentation:")
        print("   - POST /api/auth/login")
        print("   - POST /api/datasets/upload")
        print("   - POST /api/datasets/<id>/process")
        print("   - GET  /api/leakages")
        print("   - GET  /api/leakages/<id>/details")
        print("   - POST /api/tickets/generate")
        print("   - GET  /api/tickets")
        print("   - POST /api/tickets/<id>/resolve")
        print("   - GET  /api/stats")
        print("\n" + "="*50)
        
        app.run(debug=Config.FLASK_DEBUG, port=5000, host='0.0.0.0')
        
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        print("💡 Make sure MongoDB is running and accessible")
        sys.exit(1)