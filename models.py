from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import json

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='sales')  # admin/manager/sales/viewer
    hashed_password = db.Column(db.String(256), nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    deals = db.relationship('Deal', foreign_keys='Deal.assigned_to', backref='assignee', lazy=True)
    accounts = db.relationship('Account', backref='assignee', lazy=True)

    def get_id(self):
        return str(self.id)

    @property
    def is_active(self):
        return self.active

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Stage(db.Model):
    __tablename__ = 'stages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    order = db.Column(db.Integer, nullable=False, default=0)
    color = db.Column(db.String(10), nullable=False, default='#6366f1')
    probability = db.Column(db.Integer, nullable=False, default=50)
    type = db.Column(db.String(10), nullable=False, default='open')  # open/won/lost
    active = db.Column(db.Boolean, default=True)

    deals = db.relationship('Deal', backref='stage', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'order': self.order,
            'color': self.color,
            'probability': self.probability,
            'type': self.type,
            'active': self.active,
        }


class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    industry = db.Column(db.String(100))
    contact_name = db.Column(db.String(150))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(150))
    location = db.Column(db.String(200))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    deals = db.relationship('Deal', backref='account', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'industry': self.industry,
            'contact_name': self.contact_name,
            'phone': self.phone,
            'email': self.email,
            'location': self.location,
            'assigned_to': self.assigned_to,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Deal(db.Model):
    __tablename__ = 'deals'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    contact_name = db.Column(db.String(150))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(150))
    business_type = db.Column(db.String(100))
    source = db.Column(db.String(100))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    stage_id = db.Column(db.Integer, db.ForeignKey('stages.id'), nullable=True)
    status = db.Column(db.String(20), default='open')  # open/won/lost/archived
    probability = db.Column(db.Integer, default=50)
    expected_value = db.Column(db.Float, default=0.0)
    closed_value = db.Column(db.Float, default=0.0)
    expected_close_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text)
    next_action = db.Column(db.String(300))
    follow_up_date = db.Column(db.Date, nullable=True)
    tags = db.Column(db.String(500))
    priority = db.Column(db.String(20), default='Medium')
    market = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    archived = db.Column(db.Boolean, default=False)

    audit_logs = db.relationship('AuditLog', foreign_keys='AuditLog.entity_id',
                                  primaryjoin='and_(AuditLog.entity_id==Deal.id, AuditLog.entity_type=="deal")',
                                  lazy=True, overlaps='audit_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'account_id': self.account_id,
            'contact_name': self.contact_name,
            'phone': self.phone,
            'email': self.email,
            'business_type': self.business_type,
            'source': self.source,
            'assigned_to': self.assigned_to,
            'stage_id': self.stage_id,
            'status': self.status,
            'probability': self.probability,
            'expected_value': self.expected_value,
            'closed_value': self.closed_value,
            'expected_close_date': self.expected_close_date.isoformat() if self.expected_close_date else None,
            'notes': self.notes,
            'next_action': self.next_action,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'tags': self.tags,
            'priority': self.priority,
            'market': self.market,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'archived': self.archived,
        }


class Target(db.Model):
    __tablename__ = 'targets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    month = db.Column(db.String(7), nullable=False)  # YYYY-MM
    metric = db.Column(db.String(50), nullable=False)  # revenue/deals/meetings/quotations/opportunities
    value = db.Column(db.Float, nullable=False, default=0.0)

    user = db.relationship('User', backref='targets', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'month': self.month,
            'metric': self.metric,
            'value': self.value,
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.Integer)
    detail = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='audit_logs', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'detail': self.detail,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
        }


class Setting(db.Model):
    __tablename__ = 'settings'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text)

    def to_dict(self):
        return {'id': self.id, 'key': self.key, 'value': self.value}


class CustomField(db.Model):
    __tablename__ = 'custom_fields'
    id = db.Column(db.Integer, primary_key=True)
    entity_type = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    field_type = db.Column(db.String(20), nullable=False, default='text')  # text/number/date/select
    options = db.Column(db.Text)  # JSON for select options

    values = db.relationship('CustomFieldValue', backref='field', lazy=True)

    def get_options(self):
        if self.options:
            try:
                return json.loads(self.options)
            except Exception:
                return []
        return []

    def to_dict(self):
        return {
            'id': self.id,
            'entity_type': self.entity_type,
            'name': self.name,
            'field_type': self.field_type,
            'options': self.get_options(),
        }


class CustomFieldValue(db.Model):
    __tablename__ = 'custom_field_values'
    id = db.Column(db.Integer, primary_key=True)
    custom_field_id = db.Column(db.Integer, db.ForeignKey('custom_fields.id'), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)
    value = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'custom_field_id': self.custom_field_id,
            'entity_id': self.entity_id,
            'value': self.value,
        }
