
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import uuid
import datetime
import random
import time
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app)

# Database initialization
def init_db():
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Datasets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS datasets (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            sector TEXT NOT NULL,
            uploaded_by TEXT NOT NULL,
            status TEXT DEFAULT 'processing',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (uploaded_by) REFERENCES users (id)
        )
    ''')
    
    # Leakages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leakages (
            id TEXT PRIMARY KEY,
            dataset_id TEXT NOT NULL,
            sector TEXT NOT NULL,
            severity TEXT NOT NULL,
            cause TEXT NOT NULL,
            root_cause TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'detected',
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dataset_id) REFERENCES datasets (id)
        )
    ''')
    
    # Tickets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            leakage_id TEXT NOT NULL,
            assigned_to TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            priority TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            root_cause TEXT NOT NULL,
            ai_suggestions TEXT,
            resolution_method TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            FOREIGN KEY (leakage_id) REFERENCES leakages (id)
        )
    ''')
    
    # Insert default users
    users = [
        ('admin-001', 'admin', generate_password_hash('password123'), 'admin', 'System Administrator'),
        ('finance-001', 'finance', generate_password_hash('password123'), 'finance', 'Finance Team Lead'),
        ('it-001', 'it', generate_password_hash('password123'), 'it', 'IT Support Manager')
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO users (id, username, password_hash, role, name)
        VALUES (?, ?, ?, ?, ?)
    ''', users)
    
    conn.commit()
    conn.close()

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
                'id': str(uuid.uuid4()),
                'sector': sector,
                'severity': template['severity'],
                'cause': template['cause'],
                'root_cause': template['root_cause'],
                'amount': template['amount'],
                'status': 'detected'
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
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, username, password_hash, role, name FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user[2], password):
        return jsonify({
            'success': True,
            'user': {
                'id': user[0],
                'username': user[1],
                'role': user[3],
                'name': user[4]
            }
        })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/datasets/upload', methods=['POST'])
def upload_dataset():
    data = request.get_json()
    filename = data.get('filename')
    sector = data.get('sector')
    uploaded_by = data.get('uploaded_by')
    
    dataset_id = str(uuid.uuid4())
    
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO datasets (id, filename, sector, uploaded_by, status)
        VALUES (?, ?, ?, ?, 'processing')
    ''', (dataset_id, filename, sector, uploaded_by))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'dataset_id': dataset_id,
        'message': 'Dataset uploaded successfully'
    })

@app.route('/api/datasets/<dataset_id>/process', methods=['POST'])
def process_dataset(dataset_id):
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    # Get dataset info
    cursor.execute('SELECT filename, sector FROM datasets WHERE id = ?', (dataset_id,))
    dataset = cursor.fetchone()
    
    if not dataset:
        return jsonify({'success': False, 'message': 'Dataset not found'}), 404
    
    filename, sector = dataset
    
    # Simulate AI processing pipeline
    chunk_result = AIProcessor.chunk_dataset(filename, sector)
    embedding_result = AIProcessor.generate_embeddings(chunk_result['chunks'])
    detected_leakages = AIProcessor.detect_leakages(sector, embedding_result['embeddings'])
    
    # Store detected leakages
    for leakage in detected_leakages:
        cursor.execute('''
            INSERT INTO leakages (id, dataset_id, sector, severity, cause, root_cause, amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            leakage['id'], dataset_id, leakage['sector'], leakage['severity'],
            leakage['cause'], leakage['root_cause'], leakage['amount'], leakage['status']
        ))
    
    # Update dataset status
    cursor.execute('UPDATE datasets SET status = ? WHERE id = ?', ('completed', dataset_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'leakages_detected': len(detected_leakages),
        'leakages': detected_leakages
    })

@app.route('/api/leakages', methods=['GET'])
def get_leakages():
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, dataset_id, sector, severity, cause, root_cause, amount, status, detected_at
        FROM leakages ORDER BY detected_at DESC
    ''')
    
    leakages = []
    for row in cursor.fetchall():
        leakages.append({
            'id': row[0],
            'dataset_id': row[1],
            'sector': row[2],
            'severity': row[3],
            'cause': row[4],
            'root_cause': row[5],
            'amount': row[6],
            'status': row[7],
            'detected_at': row[8]
        })
    
    conn.close()
    return jsonify({'leakages': leakages})

@app.route('/api/tickets/generate', methods=['POST'])
def generate_ticket():
    data = request.get_json()
    leakage_id = data.get('leakage_id')
    
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    # Get leakage details
    cursor.execute('SELECT sector, severity, cause, root_cause FROM leakages WHERE id = ?', (leakage_id,))
    leakage = cursor.fetchone()
    
    if not leakage:
        return jsonify({'success': False, 'message': 'Leakage not found'}), 404
    
    sector, severity, cause, root_cause = leakage
    
    # Determine assignment based on sector
    assigned_to = 'finance' if sector == 'banking' else 'it'
    
    # Generate ticket ID
    cursor.execute('SELECT COUNT(*) FROM tickets')
    ticket_count = cursor.fetchone()[0]
    ticket_id = f'T{str(ticket_count + 1).zfill(3)}'
    
    # Generate AI suggestions
    ai_suggestions = AIProcessor.generate_ai_suggestions({'sector': sector})
    
    # Priority mapping
    priority_map = {'critical': 'critical', 'high': 'high', 'medium': 'medium', 'low': 'low'}
    priority = priority_map.get(severity, 'medium')
    
    # Create ticket
    cursor.execute('''
        INSERT INTO tickets (id, leakage_id, assigned_to, priority, title, description, root_cause, ai_suggestions, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        ticket_id, leakage_id, assigned_to, severity,
        f'🚨 {severity.upper()}: {cause}', 
        f'Revenue leakage detected in {sector} sector. Root cause: {root_cause}', 
        root_cause, json.dumps(ai_suggestions), 'open'
    ))
    
    # Update leakage status
    cursor.execute('UPDATE leakages SET status = ? WHERE id = ?', ('ticket-generated', leakage_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'ticket_id': ticket_id,
        'assigned_to': assigned_to,
        'message': f'Ticket {ticket_id} generated successfully'
    })

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    role = request.args.get('role')
    
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    if role == 'all':
        # Admin can see all tickets
        cursor.execute('''
            SELECT t.id, t.leakage_id, t.assigned_to, t.status, t.priority, t.title, 
                   t.description, t.root_cause, t.ai_suggestions, t.resolution_method,
                   t.created_at, t.resolved_at, l.sector, l.amount
            FROM tickets t
            JOIN leakages l ON t.leakage_id = l.id
            ORDER BY t.created_at DESC
        ''')
    elif role in ['finance', 'it']:
        cursor.execute('''
            SELECT t.id, t.leakage_id, t.assigned_to, t.status, t.priority, t.title, 
                   t.description, t.root_cause, t.ai_suggestions, t.resolution_method,
                   t.created_at, t.resolved_at, l.sector, l.amount
            FROM tickets t
            JOIN leakages l ON t.leakage_id = l.id
            WHERE t.assigned_to = ?
            ORDER BY t.created_at DESC
        ''', (role,))
    else:
        cursor.execute('''
            SELECT t.id, t.leakage_id, t.assigned_to, t.status, t.priority, t.title, 
                   t.description, t.root_cause, t.ai_suggestions, t.resolution_method,
                   t.created_at, t.resolved_at, l.sector, l.amount
            FROM tickets t
            JOIN leakages l ON t.leakage_id = l.id
            ORDER BY t.created_at DESC
        ''')
    
    tickets = []
    for row in cursor.fetchall():
        ai_suggestions = json.loads(row[8]) if row[8] else []
        tickets.append({
            'id': row[0],
            'leakage_id': row[1],
            'assigned_to': row[2],
            'status': row[3],
            'priority': row[4],
            'title': row[5],
            'description': row[6],
            'root_cause': row[7],
            'ai_suggestions': ai_suggestions,
            'resolution_method': row[9],
            'created_at': row[10],
            'resolved_at': row[11],
            'sector': row[12],
            'amount': row[13]
        })
    
    conn.close()
    return jsonify({'tickets': tickets})

@app.route('/api/tickets/<ticket_id>/resolve', methods=['POST'])
def resolve_ticket(ticket_id):
    data = request.get_json()
    method = data.get('method')  # 'ai' or 'manual'
    custom_solutions = data.get('solutions', [])
    
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    # Update ticket
    cursor.execute('''
        UPDATE tickets 
        SET status = 'resolved', resolution_method = ?, resolved_at = ?
        WHERE id = ?
    ''', (method, datetime.datetime.now().isoformat(), ticket_id))
    
    # Get leakage ID and update leakage status
    cursor.execute('SELECT leakage_id FROM tickets WHERE id = ?', (ticket_id,))
    leakage_id = cursor.fetchone()[0]
    
    cursor.execute('UPDATE leakages SET status = ? WHERE id = ?', ('resolved', leakage_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': f'Ticket {ticket_id} resolved successfully'
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    # Get various statistics
    cursor.execute('SELECT COUNT(*) FROM leakages')
    total_leakages = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM tickets')
    total_tickets = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM tickets WHERE status = "resolved"')
    resolved_tickets = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM tickets WHERE status != "resolved"')
    pending_tickets = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM tickets WHERE resolution_method = "ai"')
    ai_resolutions = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM tickets WHERE resolution_method = "manual"')
    manual_resolutions = cursor.fetchone()[0]
    
    # Severity distribution
    cursor.execute('SELECT severity, COUNT(*) FROM leakages GROUP BY severity')
    severity_data = dict(cursor.fetchall())
    
    # Sector distribution
    cursor.execute('SELECT sector, COUNT(*) FROM leakages GROUP BY sector')
    sector_data = dict(cursor.fetchall())
    
    # Revenue impact by sector
    cursor.execute('SELECT sector, SUM(amount) FROM leakages GROUP BY sector')
    revenue_impact = dict(cursor.fetchall())
    
    conn.close()
    
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

@app.route('/api/leakages/<leakage_id>/details', methods=['GET'])
def get_leakage_details(leakage_id):
    conn = sqlite3.connect('revenue_system.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT l.*, d.sector as dataset_sector
        FROM leakages l
        JOIN datasets d ON l.dataset_id = d.id
        WHERE l.id = ?
    ''', (leakage_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return jsonify({'success': False, 'message': 'Leakage not found'}), 404
    
    # Determine department assignment
    sector = row[2]
    assigned_department = 'Finance Team' if sector == 'banking' else 'IT Support Team'
    
    leakage_details = {
        'id': row[0],
        'sector': row[2],
        'severity': row[3],
        'cause': row[4],
        'root_cause': row[5],
        'amount': row[6],
        'status': row[7],
        'detected_at': row[8],
        'assigned_department': assigned_department
    }
    
    return jsonify({'leakage': leakage_details})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)