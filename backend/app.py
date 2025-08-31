
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import json
import uuid
import datetime
import random
import time
import os
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'revenue_leakage_system')

try:
    # MongoDB connection options for better compatibility
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=10000,  # 10 second timeout
        connectTimeoutMS=20000,          # 20 second connection timeout
        socketTimeoutMS=20000,           # 20 second socket timeout
        maxPoolSize=50,                  # Connection pool size
        retryWrites=True,                # Enable retry writes
        retryReads=True                  # Enable retry reads
    )
    # Test the connection
    client.admin.command('ping')
    db = client[DB_NAME]
    print(f"✅ Connected to MongoDB: {DB_NAME}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    db = None

# Database initialization
def init_db():
    if db is None:
        print("❌ Database not available")
        return
    
    # Create collections with validation
    try:
        # Users collection
        if 'users' not in db.list_collection_names():
            db.create_collection('users')
            db.users.create_index('username', unique=True)
            print("✅ Users collection created")
        
        # Datasets collection
        if 'datasets' not in db.list_collection_names():
            db.create_collection('datasets')
            print("✅ Datasets collection created")
        
        # Leakages collection
        if 'leakages' not in db.list_collection_names():
            db.create_collection('leakages')
            print("✅ Leakages collection created")
        
        # Tickets collection
        if 'tickets' not in db.list_collection_names():
            db.create_collection('tickets')
            print("✅ Tickets collection created")
        
        # Insert default users if they don't exist
        if db.users.count_documents({}) == 0:
            default_users = [
                {
                    'username': 'admin',
                    'password_hash': generate_password_hash('password123'),
                    'role': 'admin',
                    'name': 'System Administrator',
                    'created_at': datetime.datetime.now()
                },
                {
                    'username': 'finance',
                    'password_hash': generate_password_hash('password123'),
                    'role': 'finance',
                    'name': 'Finance Team Lead',
                    'created_at': datetime.datetime.now()
                },
                {
                    'username': 'it',
                    'password_hash': generate_password_hash('password123'),
                    'role': 'it',
                    'name': 'IT Support Manager',
                    'created_at': datetime.datetime.now()
                }
            ]
            
            db.users.insert_many(default_users)
            print("✅ Default users created")
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

# AI Processing Simulation
class AIProcessor:
    @staticmethod
    def chunk_dataset(filename, sector):
        """Simulate dataset chunking"""
        time.sleep(1)  # Simulate processing time
        return {"chunks": random.randint(50, 200), "status": "completed"}
    
    @staticmethod
    def generate_embeddings(chunks):
        """Simulate embedding generation"""
        time.sleep(1.5)
        return {"embeddings": chunks * 512, "status": "completed"}
    
    @staticmethod
    def detect_leakages(sector, embeddings):
        """Simulate AI leakage detection"""
        time.sleep(2)
        
        leakage_templates = {
            'telecom': [
                {
                    'severity': 'critical',
                    'cause': 'Roaming charges calculation error',
                    'root_cause': 'Outdated roaming partner rate tables causing incorrect billing',
                    'amount': random.randint(20000, 80000)
                },
                {
                    'severity': 'high',
                    'cause': 'Data usage billing discrepancy',
                    'root_cause': 'Inconsistent data measurement units between systems',
                    'amount': random.randint(15000, 45000)
                },
                {
                    'severity': 'medium',
                    'cause': 'SMS billing anomaly',
                    'root_cause': 'International SMS rate configuration mismatch',
                    'amount': random.randint(5000, 25000)
                }
            ],
            'healthcare': [
                {
                    'severity': 'critical',
                    'cause': 'Insurance reimbursement gap',
                    'root_cause': 'Outdated CPT code mappings in billing system',
                    'amount': random.randint(30000, 100000)
                },
                {
                    'severity': 'high',
                    'cause': 'Prescription billing error',
                    'root_cause': 'Pharmacy network pricing synchronization failure',
                    'amount': random.randint(20000, 60000)
                },
                {
                    'severity': 'medium',
                    'cause': 'Patient copay miscalculation',
                    'root_cause': 'Insurance plan tier verification delay',
                    'amount': random.randint(8000, 30000)
                }
            ],
            'banking': [
                {
                    'severity': 'critical',
                    'cause': 'Foreign exchange fee error',
                    'root_cause': 'Delayed currency conversion rate updates',
                    'amount': random.randint(25000, 90000)
                },
                {
                    'severity': 'high',
                    'cause': 'Transaction fee miscalculation',
                    'root_cause': 'Merchant category code classification error',
                    'amount': random.randint(18000, 55000)
                },
                {
                    'severity': 'medium',
                    'cause': 'Interest calculation discrepancy',
                    'root_cause': 'Compound interest formula configuration mismatch',
                    'amount': random.randint(10000, 35000)
                }
            ]
        }
        
        templates = leakage_templates.get(sector, [])
        num_leakages = random.randint(2, 5)
        detected_leakages = []
        
        for i in range(num_leakages):
            template = random.choice(templates)
            leakage = {
                'sector': sector,
                'severity': template['severity'],
                'cause': template['cause'],
                'root_cause': template['root_cause'],
                'amount': template['amount'],
                'status': 'detected',
                'detected_at': datetime.datetime.now()
            }
            detected_leakages.append(leakage)
        
        return detected_leakages
    
    @staticmethod
    def generate_ai_suggestions(ticket_data):
        """Generate AI suggestions for ticket resolution"""
        suggestions_map = {
            'telecom': [
                'Update roaming partner rate configuration in billing system',
                'Implement real-time rate synchronization with partner networks',
                'Add automated validation checks for international charges',
                'Deploy machine learning model for anomaly detection in billing'
            ],
            'healthcare': [
                'Refresh CPT code mappings with latest medical billing standards',
                'Implement automated insurance verification workflow',
                'Add real-time pharmacy network pricing updates',
                'Deploy AI-powered claim validation system'
            ],
            'banking': [
                'Synchronize currency exchange rates with multiple providers',
                'Implement automated merchant category validation',
                'Add real-time transaction monitoring alerts',
                'Deploy AI-powered fraud detection system'
            ]
        }
        
        sector = ticket_data.get('sector', 'banking')
        suggestions = suggestions_map.get(sector, suggestions_map['banking'])
        return random.sample(suggestions, min(3, len(suggestions)))

# Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = db.users.find_one({'username': username})
    
    if user and check_password_hash(user['password_hash'], password):
        return jsonify({
            'success': True,
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'role': user['role'],
                'name': user['name']
            }
        })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/datasets/upload', methods=['POST'])
def upload_dataset():
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    data = request.get_json()
    filename = data.get('filename')
    sector = data.get('sector')
    uploaded_by = data.get('uploaded_by')
    
    dataset = {
        'filename': filename,
        'sector': sector,
        'uploaded_by': uploaded_by,
        'status': 'processing',
        'created_at': datetime.datetime.now()
    }
    
    result = db.datasets.insert_one(dataset)
    
    return jsonify({
        'success': True,
        'dataset_id': str(result.inserted_id),
        'message': 'Dataset uploaded successfully'
    })

@app.route('/api/datasets/<dataset_id>/process', methods=['POST'])
def process_dataset(dataset_id):
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    try:
        # Get dataset info
        dataset = db.datasets.find_one({'_id': ObjectId(dataset_id)})
        
        if not dataset:
            return jsonify({'success': False, 'message': 'Dataset not found'}), 404
        
        filename = dataset['filename']
        sector = dataset['sector']
        
        # Simulate AI processing pipeline
        chunk_result = AIProcessor.chunk_dataset(filename, sector)
        embedding_result = AIProcessor.generate_embeddings(chunk_result['chunks'])
        detected_leakages = AIProcessor.detect_leakages(sector, embedding_result['embeddings'])
        
        # Store detected leakages
        for leakage in detected_leakages:
            leakage['dataset_id'] = dataset_id
            db.leakages.insert_one(leakage)
        
        # Update dataset status
        db.datasets.update_one(
            {'_id': ObjectId(dataset_id)},
            {'$set': {'status': 'completed'}}
        )
        
        return jsonify({
            'success': True,
            'leakages_detected': len(detected_leakages),
            'leakages': detected_leakages
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/leakages', methods=['GET'])
def get_leakages():
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    leakages = list(db.leakages.find().sort('detected_at', -1))
    
    # Convert ObjectId to string for JSON serialization
    for leakage in leakages:
        leakage['id'] = str(leakage['_id'])
        leakage['_id'] = str(leakage['_id'])
        if 'dataset_id' in leakage:
            leakage['dataset_id'] = str(leakage['dataset_id'])
    
    return jsonify({'leakages': leakages})

@app.route('/api/tickets/generate', methods=['POST'])
def generate_ticket():
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    data = request.get_json()
    leakage_id = data.get('leakage_id')
    
    try:
        # Get leakage details
        leakage = db.leakages.find_one({'_id': ObjectId(leakage_id)})
        
        if not leakage:
            return jsonify({'success': False, 'message': 'Leakage not found'}), 404
        
        sector = leakage['sector']
        severity = leakage['severity']
        cause = leakage['cause']
        root_cause = leakage['root_cause']
        
        # Determine assignment based on sector
        assigned_to = 'finance' if sector == 'banking' else 'it'
        
        # Generate ticket ID
        ticket_count = db.tickets.count_documents({})
        ticket_id = f'T{str(ticket_count + 1).zfill(3)}'
        
        # Generate AI suggestions
        ai_suggestions = AIProcessor.generate_ai_suggestions({'sector': sector})
        
        # Priority mapping
        priority_map = {'critical': 'critical', 'high': 'high', 'medium': 'medium', 'low': 'low'}
        priority = priority_map.get(severity, 'medium')
        
        # Create ticket
        ticket = {
            'id': ticket_id,
            'leakage_id': leakage_id,
            'assigned_to': assigned_to,
            'priority': severity,
            'title': f'🚨 {severity.upper()}: {cause}',
            'description': f'Revenue leakage detected in {sector} sector. Root cause: {root_cause}',
            'root_cause': root_cause,
            'ai_suggestions': ai_suggestions,
            'status': 'open',
            'created_at': datetime.datetime.now()
        }
        
        db.tickets.insert_one(ticket)
        
        # Update leakage status
        db.leakages.update_one(
            {'_id': ObjectId(leakage_id)},
            {'$set': {'status': 'ticket-generated'}}
        )
        
        return jsonify({
            'success': True,
            'ticket_id': ticket_id,
            'assigned_to': assigned_to,
            'message': f'Ticket {ticket_id} generated successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    role = request.args.get('role')
    
    try:
        if role == 'all':
            # Admin can see all tickets
            pipeline = [
                {
                    '$lookup': {
                        'from': 'leakages',
                        'localField': 'leakage_id',
                        'foreignField': '_id',
                        'as': 'leakage'
                    }
                },
                {'$unwind': '$leakage'},
                {
                    '$project': {
                        'id': '$id',
                        'leakage_id': '$leakage_id',
                        'assigned_to': '$assigned_to',
                        'status': '$status',
                        'priority': '$priority',
                        'title': '$title',
                        'description': '$description',
                        'root_cause': '$root_cause',
                        'ai_suggestions': '$ai_suggestions',
                        'resolution_method': '$resolution_method',
                        'created_at': '$created_at',
                        'resolved_at': '$resolved_at',
                        'sector': '$leakage.sector',
                        'amount': '$leakage.amount'
                    }
                },
                {'$sort': {'created_at': -1}}
            ]
        elif role in ['finance', 'it']:
            pipeline = [
                {'$match': {'assigned_to': role}},
                {
                    '$lookup': {
                        'from': 'leakages',
                        'localField': 'leakage_id',
                        'foreignField': '_id',
                        'as': 'leakage'
                    }
                },
                {'$unwind': '$leakage'},
                {
                    '$project': {
                        'id': '$id',
                        'leakage_id': '$leakage_id',
                        'assigned_to': '$assigned_to',
                        'status': '$status',
                        'priority': '$priority',
                        'title': '$title',
                        'description': '$description',
                        'root_cause': '$root_cause',
                        'ai_suggestions': '$ai_suggestions',
                        'resolution_method': '$resolution_method',
                        'created_at': '$created_at',
                        'resolved_at': '$resolved_at',
                        'sector': '$leakage.sector',
                        'amount': '$leakage.amount'
                    }
                },
                {'$sort': {'created_at': -1}}
            ]
        else:
            pipeline = [
                {
                    '$lookup': {
                        'from': 'leakages',
                        'localField': 'leakage_id',
                        'foreignField': '_id',
                        'as': 'leakage'
                    }
                },
                {'$unwind': '$leakage'},
                {
                    '$project': {
                        'id': '$id',
                        'leakage_id': '$leakage_id',
                        'assigned_to': '$assigned_to',
                        'status': '$status',
                        'priority': '$priority',
                        'title': '$title',
                        'description': '$description',
                        'root_cause': '$root_cause',
                        'ai_suggestions': '$ai_suggestions',
                        'resolution_method': '$resolution_method',
                        'created_at': '$created_at',
                        'resolved_at': '$resolved_at',
                        'sector': '$leakage.sector',
                        'amount': '$leakage.amount'
                    }
                },
                {'$sort': {'created_at': -1}}
            ]
        
        tickets = list(db.tickets.aggregate(pipeline))
        
        # Convert ObjectId to string for JSON serialization
        for ticket in tickets:
            if 'leakage_id' in ticket:
                ticket['leakage_id'] = str(ticket['leakage_id'])
        
        return jsonify({'tickets': tickets})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/tickets/<ticket_id>/resolve', methods=['POST'])
def resolve_ticket(ticket_id):
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    data = request.get_json()
    method = data.get('method')  # 'ai' or 'manual'
    custom_solutions = data.get('solutions', [])
    
    try:
        # Update ticket
        update_data = {
            'status': 'resolved',
            'resolution_method': method,
            'resolved_at': datetime.datetime.now()
        }
        
        if method == 'manual' and custom_solutions:
            update_data['custom_solutions'] = custom_solutions
        
        db.tickets.update_one(
            {'id': ticket_id},
            {'$set': update_data}
        )
        
        # Get leakage ID and update leakage status
        ticket = db.tickets.find_one({'id': ticket_id})
        if ticket and 'leakage_id' in ticket:
            leakage_id = ticket['leakage_id']
            db.leakages.update_one(
                {'_id': ObjectId(leakage_id)},
                {'$set': {'status': 'resolved'}}
            )
        
        return jsonify({
            'success': True,
            'message': f'Ticket {ticket_id} resolved successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    try:
        # Get various statistics
        total_leakages = db.leakages.count_documents({})
        total_tickets = db.tickets.count_documents({})
        resolved_tickets = db.tickets.count_documents({'status': 'resolved'})
        pending_tickets = db.tickets.count_documents({'status': {'$ne': 'resolved'}})
        ai_resolutions = db.tickets.count_documents({'resolution_method': 'ai'})
        manual_resolutions = db.tickets.count_documents({'resolution_method': 'manual'})
        
        # Severity distribution
        severity_pipeline = [
            {'$group': {'_id': '$severity', 'count': {'$sum': 1}}}
        ]
        severity_data = {}
        for doc in db.leakages.aggregate(severity_pipeline):
            severity_data[doc['_id']] = doc['count']
        
        # Sector distribution
        sector_pipeline = [
            {'$group': {'_id': '$sector', 'count': {'$sum': 1}}}
        ]
        sector_data = {}
        for doc in db.leakages.aggregate(sector_pipeline):
            sector_data[doc['_id']] = doc['count']
        
        # Revenue impact by sector
        revenue_pipeline = [
            {'$group': {'_id': '$sector', 'total_amount': {'$sum': '$amount'}}}
        ]
        revenue_impact = {}
        for doc in db.leakages.aggregate(revenue_pipeline):
            revenue_impact[doc['_id']] = doc['total_amount']
        
        return jsonify({
            'total_leakages': total_leakages,
            'total_tickets': total_tickets,
            'resolved_tickets': resolved_tickets,
            'pending_tickets': pending_tickets,
            'ai_resolutions': ai_resolutions,
            'manual_resolutions': manual_resolutions,
            'severity_distribution': severity_data,
            'sector_distribution': sector_data,
            'revenue_impact_by_sector': revenue_impact
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/leakages/<leakage_id>/details', methods=['GET'])
def get_leakage_details(leakage_id):
    if db is None:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500
    
    try:
        leakage = db.leakages.find_one({'_id': ObjectId(leakage_id)})
        
        if not leakage:
            return jsonify({'success': False, 'message': 'Leakage not found'}), 404
        
        # Determine department assignment
        sector = leakage['sector']
        assigned_department = 'Finance Team' if sector == 'banking' else 'IT Support Team'
        
        leakage_details = {
            'id': str(leakage['_id']),
            'sector': leakage['sector'],
            'severity': leakage['severity'],
            'cause': leakage['cause'],
            'root_cause': leakage['root_cause'],
            'amount': leakage['amount'],
            'status': leakage['status'],
            'detected_at': leakage['detected_at'],
            'assigned_department': assigned_department
        }
        
        return jsonify({'leakage': leakage_details})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)