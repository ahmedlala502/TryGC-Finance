"""
Seed script - run ONCE after creating the database.
Usage: python seed.py
"""
import json
import random
from datetime import datetime, date, timedelta
from app import app, db
from models import User, Stage, Deal, Account, Target, Setting
from werkzeug.security import generate_password_hash

STAGES_DATA = [
    {'name': 'New Lead',          'order': 1,  'color': '#3b82f6', 'probability': 10,  'type': 'open'},
    {'name': 'Contacted',         'order': 2,  'color': '#06b6d4', 'probability': 20,  'type': 'open'},
    {'name': 'Qualified',         'order': 3,  'color': '#14b8a6', 'probability': 30,  'type': 'open'},
    {'name': 'Meeting Scheduled', 'order': 4,  'color': '#6366f1', 'probability': 40,  'type': 'open'},
    {'name': 'Meeting Done',      'order': 5,  'color': '#8b5cf6', 'probability': 50,  'type': 'open'},
    {'name': 'Quotation Sent',    'order': 6,  'color': '#f97316', 'probability': 60,  'type': 'open'},
    {'name': 'Negotiation',       'order': 7,  'color': '#f59e0b', 'probability': 70,  'type': 'open'},
    {'name': 'Proposal Shared',   'order': 8,  'color': '#eab308', 'probability': 75,  'type': 'open'},
    {'name': 'Pending Closure',   'order': 9,  'color': '#84cc16', 'probability': 85,  'type': 'open'},
    {'name': 'Closed Won',        'order': 10, 'color': '#22c55e', 'probability': 100, 'type': 'won'},
    {'name': 'Closed Lost',       'order': 11, 'color': '#ef4444', 'probability': 0,   'type': 'lost'},
]

USERS_DATA = [
    {'email': 'admin@local',   'name': 'Admin User',    'role': 'admin',   'password': 'Admin@12345'},
    {'email': 'manager@local', 'name': 'Sarah Johnson', 'role': 'manager', 'password': 'Manager@12345'},
    {'email': 'alice@local',   'name': 'Alice Chen',    'role': 'sales',   'password': 'Sales@12345'},
    {'email': 'bob@local',     'name': 'Bob Martinez',  'role': 'sales',   'password': 'Sales@12345'},
    {'email': 'viewer@local',  'name': 'View Only',     'role': 'viewer',  'password': 'Viewer@12345'},
]

ACCOUNTS_DATA = [
    {'name': 'Acme Corporation',    'industry': 'Manufacturing',  'contact_name': 'John Smith',    'phone': '+1-555-0100', 'email': 'john@acme.com',    'location': 'New York, USA'},
    {'name': 'TechVision Inc',      'industry': 'Technology',     'contact_name': 'Emily Davis',   'phone': '+1-555-0200', 'email': 'emily@techvision.com', 'location': 'San Francisco, USA'},
    {'name': 'Global Solutions Ltd','industry': 'Consulting',     'contact_name': 'Michael Brown', 'phone': '+44-20-5550300', 'email': 'michael@global.com', 'location': 'London, UK'},
    {'name': 'BuildRight Co',       'industry': 'Construction',   'contact_name': 'Sara Wilson',   'phone': '+1-555-0400', 'email': 'sara@buildright.com',  'location': 'Chicago, USA'},
    {'name': 'EduLearn Academy',    'industry': 'Education',      'contact_name': 'David Lee',     'phone': '+1-555-0500', 'email': 'david@edulearn.com',   'location': 'Austin, USA'},
]

DEAL_TITLES = [
    'Enterprise Software License', 'Cloud Migration Project', 'IT Infrastructure Upgrade',
    'Digital Transformation Initiative', 'CRM Implementation', 'ERP System Rollout',
    'Cybersecurity Assessment', 'Data Analytics Platform', 'Mobile App Development',
    'E-commerce Platform', 'Business Intelligence Dashboard', 'Training & Development Program',
    'Managed Services Contract', 'Custom Software Development', 'API Integration Project',
    'Network Infrastructure Upgrade', 'DevOps Consulting Package', 'AI/ML Implementation',
    'Staff Augmentation Contract', 'Technical Support Agreement', 'SaaS Platform License',
    'IoT Solution Deployment', 'Blockchain Integration', 'Legacy System Modernization',
    'Cloud Security Solution', 'Data Warehouse Implementation', 'Process Automation Suite',
    'Customer Portal Development', 'Supply Chain Optimization', 'Digital Marketing Platform',
]

SETTINGS_DATA = [
    {'key': 'system_name',   'value': 'TryGc - Finance & Sales Dashboard'},
    {'key': 'currency',      'value': 'USD'},
    {'key': 'date_format',   'value': '%Y-%m-%d'},
    {'key': 'markets',       'value': json.dumps(['Local', 'International', 'MENA', 'Europe'])},
    {'key': 'business_types','value': json.dumps(['Software', 'Hardware', 'Services', 'Consulting', 'Training'])},
    {'key': 'lead_sources',  'value': json.dumps(['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Email Campaign'])},
    {'key': 'priorities',    'value': json.dumps(['Low', 'Medium', 'High', 'Critical'])},
]


def seed():
    with app.app_context():
        db.create_all()

        # --- Users ---
        user_objs = {}
        for ud in USERS_DATA:
            u = User.query.filter_by(email=ud['email']).first()
            if not u:
                u = User(
                    email=ud['email'],
                    name=ud['name'],
                    role=ud['role'],
                    hashed_password=generate_password_hash(ud['password']),
                    active=True,
                )
                db.session.add(u)
                print(f'  Created user: {ud["email"]}')
            user_objs[ud['email']] = u
        db.session.commit()

        # --- Stages ---
        stage_objs = []
        for sd in STAGES_DATA:
            s = Stage.query.filter_by(name=sd['name']).first()
            if not s:
                s = Stage(**sd)
                db.session.add(s)
                print(f'  Created stage: {sd["name"]}')
            stage_objs.append(s)
        db.session.commit()

        # Reload stage_objs after commit
        stage_objs = Stage.query.order_by(Stage.order).all()

        # --- Accounts ---
        account_objs = []
        sales_users = [user_objs['alice@local'], user_objs['bob@local']]
        for i, ad in enumerate(ACCOUNTS_DATA):
            a = Account.query.filter_by(name=ad['name']).first()
            if not a:
                a = Account(
                    **ad,
                    assigned_to=sales_users[i % 2].id,
                )
                db.session.add(a)
                print(f'  Created account: {ad["name"]}')
            account_objs.append(a)
        db.session.commit()
        account_objs = Account.query.all()

        # --- Deals (30 sample deals) ---
        if Deal.query.count() == 0:
            open_stages = [s for s in stage_objs if s.type == 'open']
            won_stage = next((s for s in stage_objs if s.type == 'won'), open_stages[-1])
            lost_stage = next((s for s in stage_objs if s.type == 'lost'), open_stages[-1])

            biz_types = ['Software', 'Hardware', 'Services', 'Consulting', 'Training']
            sources = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Email Campaign']
            priorities = ['Low', 'Medium', 'High', 'Critical']
            markets = ['Local', 'International', 'MENA', 'Europe']
            statuses = ['open'] * 18 + ['won'] * 8 + ['lost'] * 4

            today = date.today()

            for i, title in enumerate(DEAL_TITLES):
                days_ago = random.randint(5, 180)
                created = datetime.utcnow() - timedelta(days=days_ago)
                status = statuses[i % len(statuses)]
                if status == 'won':
                    stage = won_stage
                elif status == 'lost':
                    stage = lost_stage
                else:
                    stage = open_stages[i % len(open_stages)]

                ev = round(random.uniform(5000, 150000), 2)
                deal = Deal(
                    title=title,
                    account_id=random.choice(account_objs).id,
                    contact_name=random.choice(['John Smith', 'Emily Davis', 'Michael Brown', 'Sara Wilson', 'David Lee']),
                    phone=f'+1-555-{random.randint(1000, 9999)}',
                    email=f'contact{i}@example.com',
                    business_type=random.choice(biz_types),
                    source=random.choice(sources),
                    assigned_to=random.choice(sales_users).id,
                    stage_id=stage.id,
                    status=status,
                    probability=stage.probability,
                    expected_value=ev,
                    closed_value=round(ev * random.uniform(0.85, 1.1), 2) if status == 'won' else 0.0,
                    expected_close_date=today + timedelta(days=random.randint(7, 90)),
                    follow_up_date=today + timedelta(days=random.randint(-5, 30)),
                    priority=random.choice(priorities),
                    market=random.choice(markets),
                    notes=f'Sample deal notes for {title}.',
                    next_action='Follow up with client',
                    tags='crm,sample',
                    created_at=created,
                    updated_at=created + timedelta(days=random.randint(0, days_ago)),
                )
                db.session.add(deal)
                print(f'  Created deal: {title}')
            db.session.commit()

        # --- Targets ---
        curr_month = date.today().strftime('%Y-%m')
        metrics_defaults = {'revenue': 50000, 'deals': 10, 'meetings': 15, 'quotations': 8, 'opportunities': 12}
        for sales_user in sales_users:
            for metric, value in metrics_defaults.items():
                t = Target.query.filter_by(user_id=sales_user.id, month=curr_month, metric=metric).first()
                if not t:
                    t = Target(user_id=sales_user.id, month=curr_month, metric=metric, value=value)
                    db.session.add(t)
        db.session.commit()
        print('  Targets created for current month.')

        # --- Settings ---
        for sd in SETTINGS_DATA:
            s = Setting.query.filter_by(key=sd['key']).first()
            if not s:
                s = Setting(key=sd['key'], value=sd['value'])
                db.session.add(s)
        db.session.commit()
        print('  Settings seeded.')

        print('\nSeed complete!')
        print('Login credentials:')
        for ud in USERS_DATA:
            print(f"  {ud['email']}  /  {ud['password']}  ({ud['role']})")


if __name__ == '__main__':
    seed()
