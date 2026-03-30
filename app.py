import os
import json
import io
from datetime import datetime, date, timedelta
from functools import wraps
from collections import defaultdict

from flask import (Flask, render_template, request, redirect, url_for,
                   flash, jsonify, send_file, g, abort)
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import pandas as pd
from sqlalchemy import func, and_, or_, extract

from models import db, User, Stage, Deal, Account, Target, AuditLog, Setting, CustomField, CustomFieldValue

# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.secret_key = 'super-secret-key-change-in-production-2024'
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'sales_crm.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db.init_app(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'warning'


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def log_audit(action, entity_type=None, entity_id=None, detail=''):
    user_id = current_user.id if current_user and current_user.is_authenticated else None
    entry = AuditLog(user_id=user_id, action=action,
                     entity_type=entity_type, entity_id=entity_id, detail=detail)
    db.session.add(entry)
    db.session.commit()


def get_setting(key, default=None):
    s = Setting.query.filter_by(key=key).first()
    return s.value if s else default


def get_settings_dict():
    settings = Setting.query.all()
    return {s.key: s.value for s in settings}


def parse_json_setting(key, default=None):
    val = get_setting(key)
    if val:
        try:
            return json.loads(val)
        except Exception:
            pass
    return default or []


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('login'))
            if current_user.role not in roles:
                abort(403)
            return f(*args, **kwargs)
        return decorated
    return decorator


def viewer_readonly(f):
    """Block viewer from any state-changing operation."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if current_user.role == 'viewer':
            abort(403)
        return f(*args, **kwargs)
    return decorated


def can_edit_deal(deal):
    """Return True if current user can edit this deal."""
    if current_user.role in ('admin', 'manager'):
        return True
    if current_user.role == 'sales' and deal.assigned_to == current_user.id:
        return True
    return False


def apply_deal_filters(query, args):
    date_from = args.get('date_from')
    date_to = args.get('date_to')
    rep_id = args.get('rep_id')
    stage_id = args.get('stage_id')
    business_type = args.get('business_type')
    source = args.get('source')
    status = args.get('status')
    priority = args.get('priority')
    search = args.get('search')
    market = args.get('market')
    account_id = args.get('account_id')

    if date_from:
        try:
            query = query.filter(Deal.created_at >= datetime.strptime(date_from, '%Y-%m-%d'))
        except ValueError:
            pass
    if date_to:
        try:
            query = query.filter(Deal.created_at <= datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1))
        except ValueError:
            pass
    if rep_id:
        query = query.filter(Deal.assigned_to == int(rep_id))
    if stage_id:
        query = query.filter(Deal.stage_id == int(stage_id))
    if business_type:
        query = query.filter(Deal.business_type == business_type)
    if source:
        query = query.filter(Deal.source == source)
    if status:
        query = query.filter(Deal.status == status)
    if priority:
        query = query.filter(Deal.priority == priority)
    if market:
        query = query.filter(Deal.market == market)
    if account_id:
        query = query.filter(Deal.account_id == int(account_id))
    if search:
        like = f'%{search}%'
        query = query.filter(or_(Deal.title.ilike(like), Deal.contact_name.ilike(like)))
    return query


# ---------------------------------------------------------------------------
# Context processor
# ---------------------------------------------------------------------------

@app.context_processor
def inject_globals():
    settings = get_settings_dict()
    stages = Stage.query.filter_by(active=True).order_by(Stage.order).all()
    users = User.query.filter_by(active=True).order_by(User.name).all()
    return dict(
        settings=settings,
        all_stages=stages,
        all_users=users,
        business_types=parse_json_setting('business_types', []),
        lead_sources=parse_json_setting('lead_sources', []),
        markets=parse_json_setting('markets', []),
        priorities=parse_json_setting('priorities', []),
        today=date.today(),
        parse_json_setting=parse_json_setting,
    )


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        user = User.query.filter_by(email=email).first()
        if user and user.active and check_password_hash(user.hashed_password, password):
            login_user(user, remember=request.form.get('remember') == 'on')
            user.last_login = datetime.utcnow()
            db.session.commit()
            log_audit('login', 'user', user.id, f'User {user.email} logged in')
            return redirect(url_for('dashboard'))
        flash('Invalid email or password.', 'danger')
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    log_audit('logout', 'user', current_user.id, f'User {current_user.email} logged out')
    logout_user()
    flash('Logged out successfully.', 'info')
    return redirect(url_for('login'))


@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'update_info':
            current_user.name = request.form.get('name', current_user.name).strip()
            db.session.commit()
            log_audit('update', 'user', current_user.id, 'Profile info updated')
            flash('Profile updated.', 'success')
        elif action == 'change_password':
            old_pw = request.form.get('old_password', '')
            new_pw = request.form.get('new_password', '')
            if not check_password_hash(current_user.hashed_password, old_pw):
                flash('Current password is incorrect.', 'danger')
            elif len(new_pw) < 6:
                flash('New password must be at least 6 characters.', 'danger')
            else:
                current_user.hashed_password = generate_password_hash(new_pw)
                db.session.commit()
                log_audit('password_change', 'user', current_user.id, 'Password changed')
                flash('Password changed successfully.', 'success')
    return render_template('profile.html')


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

@app.route('/')
@login_required
def dashboard():
    args = request.args

    base_q = Deal.query.filter_by(archived=False)
    # Role-based filtering
    if current_user.role == 'sales':
        base_q = base_q.filter(Deal.assigned_to == current_user.id)

    filtered_q = apply_deal_filters(base_q, args)
    all_deals = filtered_q.all()

    stages = Stage.query.filter_by(active=True).order_by(Stage.order).all()
    stage_map = {s.id: s for s in stages}
    users = User.query.filter_by(active=True).all()
    user_map = {u.id: u for u in users}

    today = date.today()

    # KPI computation
    total_leads = len(all_deals)
    qualified = sum(1 for d in all_deals if d.stage_id and stage_map.get(d.stage_id) and stage_map[d.stage_id].order >= 3)
    meetings = sum(1 for d in all_deals if d.stage_id and stage_map.get(d.stage_id) and 'meeting' in stage_map[d.stage_id].name.lower())
    quotations = sum(1 for d in all_deals if d.stage_id and stage_map.get(d.stage_id) and 'quotation' in stage_map[d.stage_id].name.lower())
    opportunities = sum(1 for d in all_deals if d.stage_id and stage_map.get(d.stage_id) and stage_map[d.stage_id].order >= 4 and stage_map[d.stage_id].type == 'open')
    pending_closure = sum(1 for d in all_deals if d.stage_id and stage_map.get(d.stage_id) and 'pending' in stage_map[d.stage_id].name.lower())
    closed_won = sum(1 for d in all_deals if d.status == 'won')
    closed_lost = sum(1 for d in all_deals if d.status == 'lost')
    conversion_rate = round((qualified / total_leads * 100) if total_leads > 0 else 0, 1)
    close_rate = round((closed_won / (closed_won + closed_lost) * 100) if (closed_won + closed_lost) > 0 else 0, 1)
    pipeline_value = sum(d.expected_value or 0 for d in all_deals if d.status == 'open')
    closed_revenue = sum(d.closed_value or d.expected_value or 0 for d in all_deals if d.status == 'won')
    avg_deal_size = round(closed_revenue / closed_won if closed_won > 0 else 0, 2)
    overdue_followups = sum(1 for d in all_deals if d.follow_up_date and d.follow_up_date < today and d.status == 'open')

    # Funnel data by stage
    stage_counts = defaultdict(int)
    for d in all_deals:
        if d.stage_id:
            s = stage_map.get(d.stage_id)
            if s:
                stage_counts[s.name] += 1
    funnel_data = {'labels': [], 'counts': [], 'colors': []}
    for s in stages:
        funnel_data['labels'].append(s.name)
        funnel_data['counts'].append(stage_counts.get(s.name, 0))
        funnel_data['colors'].append(s.color)

    # Monthly trend (last 12 months)
    monthly_trend = {'labels': [], 'values': []}
    for i in range(11, -1, -1):
        dt = today.replace(day=1) - timedelta(days=i * 28)
        month_label = dt.strftime('%b %Y')
        month_val = sum(
            (d.closed_value or d.expected_value or 0)
            for d in all_deals
            if d.status == 'won' and d.updated_at and
               d.updated_at.year == dt.year and d.updated_at.month == dt.month
        )
        monthly_trend['labels'].append(month_label)
        monthly_trend['values'].append(month_val)

    # Won vs Lost
    won_vs_lost = {'won': closed_won, 'lost': closed_lost}

    # Rep leaderboard (top 10 by revenue)
    rep_revenue = defaultdict(float)
    for d in all_deals:
        if d.status == 'won':
            rep_revenue[d.assigned_to] += (d.closed_value or d.expected_value or 0)
    sorted_reps = sorted(rep_revenue.items(), key=lambda x: x[1], reverse=True)[:10]
    rep_leaderboard = {
        'labels': [user_map[uid].name if uid and uid in user_map else 'Unknown' for uid, _ in sorted_reps],
        'values': [v for _, v in sorted_reps],
    }

    # Revenue by Rep
    rep_rev_all = defaultdict(float)
    for d in all_deals:
        if d.assigned_to and d.status == 'won':
            rep_rev_all[d.assigned_to] += (d.closed_value or d.expected_value or 0)
    revenue_by_rep = {
        'labels': [user_map[uid].name if uid in user_map else 'Unknown' for uid in rep_rev_all],
        'values': list(rep_rev_all.values()),
    }

    # Business type mix
    biz_counts = defaultdict(int)
    for d in all_deals:
        biz_counts[d.business_type or 'Unknown'] += 1
    biz_type_mix = {'labels': list(biz_counts.keys()), 'values': list(biz_counts.values())}

    # Aging deals
    buckets = {'<30': 0, '30-60': 0, '60-90': 0, '90+': 0}
    for d in all_deals:
        if d.status == 'open' and d.created_at:
            age = (datetime.utcnow() - d.created_at).days
            if age < 30:
                buckets['<30'] += 1
            elif age < 60:
                buckets['30-60'] += 1
            elif age < 90:
                buckets['60-90'] += 1
            else:
                buckets['90+'] += 1
    aging_deals = {'labels': list(buckets.keys()), 'values': list(buckets.values())}

    # Target vs Achievement
    curr_month = today.strftime('%Y-%m')
    targets = Target.query.filter_by(month=curr_month, metric='revenue').all()
    tgt_labels = []
    tgt_target = []
    tgt_actual = []
    for t in targets:
        u = user_map.get(t.user_id)
        if u:
            actual = sum((d.closed_value or d.expected_value or 0)
                         for d in all_deals
                         if d.status == 'won' and d.assigned_to == t.user_id
                         and d.updated_at and d.updated_at.strftime('%Y-%m') == curr_month)
            tgt_labels.append(u.name)
            tgt_target.append(t.value)
            tgt_actual.append(actual)
    target_vs_achievement = {'labels': tgt_labels, 'target': tgt_target, 'actual': tgt_actual}

    chart_data = {
        'funnel_data': funnel_data,
        'monthly_trend': monthly_trend,
        'won_vs_lost': won_vs_lost,
        'rep_leaderboard': rep_leaderboard,
        'revenue_by_rep': revenue_by_rep,
        'biz_type_mix': biz_type_mix,
        'aging_deals': aging_deals,
        'target_vs_achievement': target_vs_achievement,
    }

    kpis = {
        'total_leads': total_leads,
        'qualified': qualified,
        'meetings': meetings,
        'quotations': quotations,
        'opportunities': opportunities,
        'pending_closure': pending_closure,
        'closed_won': closed_won,
        'closed_lost': closed_lost,
        'conversion_rate': conversion_rate,
        'close_rate': close_rate,
        'pipeline_value': pipeline_value,
        'closed_revenue': closed_revenue,
        'avg_deal_size': avg_deal_size,
        'overdue_followups': overdue_followups,
    }

    return render_template('dashboard.html',
                           kpis=kpis,
                           chart_data=chart_data,
                           users=users,
                           stages=stages,
                           filters=args)


# ---------------------------------------------------------------------------
# Deals
# ---------------------------------------------------------------------------

@app.route('/deals')
@login_required
def deals_table():
    args = request.args
    page = int(args.get('page', 1))
    per_page = int(args.get('per_page', 25))

    q = Deal.query.filter_by(archived=False)
    if current_user.role == 'sales':
        q = q.filter(Deal.assigned_to == current_user.id)

    q = apply_deal_filters(q, args)

    sort_by = args.get('sort', 'created_at')
    sort_dir = args.get('dir', 'desc')
    col_map = {
        'title': Deal.title,
        'expected_value': Deal.expected_value,
        'created_at': Deal.created_at,
        'expected_close_date': Deal.expected_close_date,
        'priority': Deal.priority,
    }
    sort_col = col_map.get(sort_by, Deal.created_at)
    if sort_dir == 'asc':
        q = q.order_by(sort_col.asc())
    else:
        q = q.order_by(sort_col.desc())

    total = q.count()
    deals = q.offset((page - 1) * per_page).limit(per_page).all()

    stages = Stage.query.filter_by(active=True).order_by(Stage.order).all()
    users = User.query.filter_by(active=True).all()
    accounts = Account.query.order_by(Account.name).all()

    return render_template('pipeline_table.html',
                           deals=deals,
                           stages=stages,
                           users=users,
                           accounts=accounts,
                           total=total,
                           page=page,
                           per_page=per_page,
                           total_pages=(total + per_page - 1) // per_page,
                           filters=args)


@app.route('/deals/kanban')
@login_required
def deals_kanban():
    stages = Stage.query.filter_by(active=True).order_by(Stage.order).all()
    q = Deal.query.filter_by(archived=False, status='open')
    if current_user.role == 'sales':
        q = q.filter(Deal.assigned_to == current_user.id)
    deals = q.all()
    users = User.query.filter_by(active=True).all()
    user_map = {u.id: u for u in users}

    kanban = {}
    for s in stages:
        kanban[s.id] = {
            'stage': s,
            'deals': [],
            'total_value': 0,
        }
    for d in deals:
        if d.stage_id and d.stage_id in kanban:
            kanban[d.stage_id]['deals'].append(d)
            kanban[d.stage_id]['total_value'] += d.expected_value or 0

    return render_template('pipeline_kanban.html',
                           stages=stages,
                           kanban=kanban,
                           user_map=user_map)


@app.route('/deals/new', methods=['GET', 'POST'])
@login_required
@viewer_readonly
def deal_new():
    stages = Stage.query.filter_by(active=True).order_by(Stage.order).all()
    users = User.query.filter_by(active=True).all()
    accounts = Account.query.order_by(Account.name).all()

    if request.method == 'POST':
        f = request.form
        deal = Deal(
            title=f.get('title', '').strip(),
            account_id=int(f['account_id']) if f.get('account_id') else None,
            contact_name=f.get('contact_name', '').strip(),
            phone=f.get('phone', '').strip(),
            email=f.get('email', '').strip(),
            business_type=f.get('business_type', ''),
            source=f.get('source', ''),
            assigned_to=int(f['assigned_to']) if f.get('assigned_to') else current_user.id,
            stage_id=int(f['stage_id']) if f.get('stage_id') else None,
            status='open',
            probability=int(f.get('probability', 50)),
            expected_value=float(f.get('expected_value', 0) or 0),
            expected_close_date=datetime.strptime(f['expected_close_date'], '%Y-%m-%d').date() if f.get('expected_close_date') else None,
            notes=f.get('notes', ''),
            next_action=f.get('next_action', ''),
            follow_up_date=datetime.strptime(f['follow_up_date'], '%Y-%m-%d').date() if f.get('follow_up_date') else None,
            tags=f.get('tags', ''),
            priority=f.get('priority', 'Medium'),
            market=f.get('market', ''),
        )
        db.session.add(deal)
        db.session.commit()
        log_audit('create', 'deal', deal.id, f'Deal created: {deal.title}')
        flash('Deal created successfully.', 'success')
        return redirect(url_for('deal_detail', deal_id=deal.id))

    return render_template('deal_detail.html',
                           deal=None,
                           stages=stages,
                           users=users,
                           accounts=accounts,
                           audit_entries=[],
                           is_new=True)


@app.route('/deals/<int:deal_id>')
@login_required
def deal_detail(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    if current_user.role == 'sales' and deal.assigned_to != current_user.id:
        abort(403)
    stages = Stage.query.filter_by(active=True).order_by(Stage.order).all()
    users = User.query.filter_by(active=True).all()
    accounts = Account.query.order_by(Account.name).all()
    audit_entries = AuditLog.query.filter_by(entity_type='deal', entity_id=deal_id).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return render_template('deal_detail.html',
                           deal=deal,
                           stages=stages,
                           users=users,
                           accounts=accounts,
                           audit_entries=audit_entries,
                           is_new=False)


@app.route('/deals/<int:deal_id>/edit', methods=['POST'])
@login_required
@viewer_readonly
def deal_edit(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    if not can_edit_deal(deal):
        abort(403)
    f = request.form
    old_stage = deal.stage_id
    deal.title = f.get('title', deal.title).strip()
    deal.account_id = int(f['account_id']) if f.get('account_id') else deal.account_id
    deal.contact_name = f.get('contact_name', deal.contact_name)
    deal.phone = f.get('phone', deal.phone)
    deal.email = f.get('email', deal.email)
    deal.business_type = f.get('business_type', deal.business_type)
    deal.source = f.get('source', deal.source)
    deal.assigned_to = int(f['assigned_to']) if f.get('assigned_to') else deal.assigned_to
    deal.stage_id = int(f['stage_id']) if f.get('stage_id') else deal.stage_id
    deal.probability = int(f.get('probability', deal.probability))
    deal.expected_value = float(f.get('expected_value', deal.expected_value) or 0)
    deal.closed_value = float(f.get('closed_value', deal.closed_value) or 0)
    deal.expected_close_date = datetime.strptime(f['expected_close_date'], '%Y-%m-%d').date() if f.get('expected_close_date') else deal.expected_close_date
    deal.notes = f.get('notes', deal.notes)
    deal.next_action = f.get('next_action', deal.next_action)
    deal.follow_up_date = datetime.strptime(f['follow_up_date'], '%Y-%m-%d').date() if f.get('follow_up_date') else deal.follow_up_date
    deal.tags = f.get('tags', deal.tags)
    deal.priority = f.get('priority', deal.priority)
    deal.market = f.get('market', deal.market)
    deal.updated_at = datetime.utcnow()
    db.session.commit()
    detail = f'Deal updated: {deal.title}'
    if old_stage != deal.stage_id:
        detail += f' | Stage changed'
    log_audit('update', 'deal', deal.id, detail)
    flash('Deal updated.', 'success')
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'ok': True})
    return redirect(url_for('deal_detail', deal_id=deal.id))


@app.route('/deals/<int:deal_id>/delete', methods=['POST'])
@login_required
@viewer_readonly
def deal_delete(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    if not can_edit_deal(deal):
        abort(403)
    title = deal.title
    db.session.delete(deal)
    db.session.commit()
    log_audit('delete', 'deal', deal_id, f'Deal deleted: {title}')
    flash('Deal deleted.', 'success')
    return redirect(url_for('deals_table'))


@app.route('/deals/<int:deal_id>/won', methods=['POST'])
@login_required
@viewer_readonly
def deal_won(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    if not can_edit_deal(deal):
        abort(403)
    won_stage = Stage.query.filter_by(type='won').first()
    deal.status = 'won'
    deal.closed_value = float(request.form.get('closed_value', deal.expected_value) or deal.expected_value)
    deal.stage_id = won_stage.id if won_stage else deal.stage_id
    deal.updated_at = datetime.utcnow()
    db.session.commit()
    log_audit('won', 'deal', deal.id, f'Deal marked won: {deal.title}')
    flash('Deal marked as Won!', 'success')
    return redirect(url_for('deal_detail', deal_id=deal.id))


@app.route('/deals/<int:deal_id>/lost', methods=['POST'])
@login_required
@viewer_readonly
def deal_lost(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    if not can_edit_deal(deal):
        abort(403)
    lost_stage = Stage.query.filter_by(type='lost').first()
    deal.status = 'lost'
    deal.stage_id = lost_stage.id if lost_stage else deal.stage_id
    deal.updated_at = datetime.utcnow()
    db.session.commit()
    log_audit('lost', 'deal', deal.id, f'Deal marked lost: {deal.title}')
    flash('Deal marked as Lost.', 'warning')
    return redirect(url_for('deal_detail', deal_id=deal.id))


@app.route('/deals/<int:deal_id>/archive', methods=['POST'])
@login_required
@viewer_readonly
def deal_archive(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    if not can_edit_deal(deal):
        abort(403)
    deal.archived = not deal.archived
    deal.updated_at = datetime.utcnow()
    db.session.commit()
    log_audit('archive', 'deal', deal.id, f'Deal archived={deal.archived}: {deal.title}')
    flash('Deal archived.' if deal.archived else 'Deal unarchived.', 'info')
    return redirect(url_for('deals_table'))


@app.route('/deals/bulk', methods=['POST'])
@login_required
@viewer_readonly
def deals_bulk():
    action = request.form.get('action')
    ids = request.form.getlist('deal_ids')
    if not ids:
        flash('No deals selected.', 'warning')
        return redirect(url_for('deals_table'))
    deal_ids = [int(i) for i in ids]
    deals = Deal.query.filter(Deal.id.in_(deal_ids)).all()

    if action == 'archive':
        for d in deals:
            d.archived = True
            d.updated_at = datetime.utcnow()
        db.session.commit()
        log_audit('bulk_archive', 'deal', None, f'Archived deal ids: {deal_ids}')
        flash(f'Archived {len(deals)} deals.', 'success')
    elif action == 'delete':
        for d in deals:
            db.session.delete(d)
        db.session.commit()
        log_audit('bulk_delete', 'deal', None, f'Deleted deal ids: {deal_ids}')
        flash(f'Deleted {len(deals)} deals.', 'success')
    elif action == 'won':
        won_stage = Stage.query.filter_by(type='won').first()
        for d in deals:
            d.status = 'won'
            d.stage_id = won_stage.id if won_stage else d.stage_id
            d.updated_at = datetime.utcnow()
        db.session.commit()
        log_audit('bulk_won', 'deal', None, f'Marked won: {deal_ids}')
        flash(f'Marked {len(deals)} deals as Won.', 'success')
    elif action == 'lost':
        lost_stage = Stage.query.filter_by(type='lost').first()
        for d in deals:
            d.status = 'lost'
            d.stage_id = lost_stage.id if lost_stage else d.stage_id
            d.updated_at = datetime.utcnow()
        db.session.commit()
        log_audit('bulk_lost', 'deal', None, f'Marked lost: {deal_ids}')
        flash(f'Marked {len(deals)} deals as Lost.', 'warning')
    elif action == 'move_stage':
        new_stage_id = int(request.form.get('new_stage_id', 0))
        if new_stage_id:
            for d in deals:
                d.stage_id = new_stage_id
                d.updated_at = datetime.utcnow()
            db.session.commit()
            log_audit('bulk_stage_change', 'deal', None, f'Moved {deal_ids} to stage {new_stage_id}')
            flash(f'Moved {len(deals)} deals.', 'success')
    return redirect(url_for('deals_table'))


# ---------------------------------------------------------------------------
# Accounts
# ---------------------------------------------------------------------------

@app.route('/accounts')
@login_required
def accounts():
    search = request.args.get('search', '')
    q = Account.query
    if search:
        q = q.filter(or_(Account.name.ilike(f'%{search}%'), Account.contact_name.ilike(f'%{search}%')))
    accs = q.order_by(Account.name).all()
    deals = Deal.query.filter_by(archived=False).all()
    deal_stats = {}
    for d in deals:
        if d.account_id:
            if d.account_id not in deal_stats:
                deal_stats[d.account_id] = {'pipeline': 0, 'revenue': 0, 'count': 0}
            deal_stats[d.account_id]['count'] += 1
            if d.status == 'open':
                deal_stats[d.account_id]['pipeline'] += d.expected_value or 0
            if d.status == 'won':
                deal_stats[d.account_id]['revenue'] += d.closed_value or d.expected_value or 0
    users = User.query.all()
    user_map = {u.id: u for u in users}
    return render_template('accounts.html',
                           accounts=accs,
                           deal_stats=deal_stats,
                           user_map=user_map,
                           search=search)


@app.route('/accounts/new', methods=['POST'])
@login_required
@viewer_readonly
def account_new():
    f = request.form
    acc = Account(
        name=f.get('name', '').strip(),
        industry=f.get('industry', ''),
        contact_name=f.get('contact_name', ''),
        phone=f.get('phone', ''),
        email=f.get('email', ''),
        location=f.get('location', ''),
        assigned_to=int(f['assigned_to']) if f.get('assigned_to') else current_user.id,
        notes=f.get('notes', ''),
    )
    db.session.add(acc)
    db.session.commit()
    log_audit('create', 'account', acc.id, f'Account created: {acc.name}')
    flash('Account created.', 'success')
    return redirect(url_for('account_detail', account_id=acc.id))


@app.route('/accounts/<int:account_id>')
@login_required
def account_detail(account_id):
    acc = Account.query.get_or_404(account_id)
    deals = Deal.query.filter_by(account_id=account_id, archived=False).all()
    users = User.query.filter_by(active=True).all()
    return render_template('account_detail.html', account=acc, deals=deals, users=users)


@app.route('/accounts/<int:account_id>/edit', methods=['POST'])
@login_required
@viewer_readonly
def account_edit(account_id):
    acc = Account.query.get_or_404(account_id)
    if current_user.role == 'sales' and acc.assigned_to != current_user.id:
        abort(403)
    f = request.form
    acc.name = f.get('name', acc.name).strip()
    acc.industry = f.get('industry', acc.industry)
    acc.contact_name = f.get('contact_name', acc.contact_name)
    acc.phone = f.get('phone', acc.phone)
    acc.email = f.get('email', acc.email)
    acc.location = f.get('location', acc.location)
    acc.assigned_to = int(f['assigned_to']) if f.get('assigned_to') else acc.assigned_to
    acc.notes = f.get('notes', acc.notes)
    db.session.commit()
    log_audit('update', 'account', acc.id, f'Account updated: {acc.name}')
    flash('Account updated.', 'success')
    return redirect(url_for('account_detail', account_id=acc.id))


@app.route('/accounts/<int:account_id>/delete', methods=['POST'])
@login_required
@role_required('admin', 'manager')
def account_delete(account_id):
    acc = Account.query.get_or_404(account_id)
    name = acc.name
    db.session.delete(acc)
    db.session.commit()
    log_audit('delete', 'account', account_id, f'Account deleted: {name}')
    flash('Account deleted.', 'success')
    return redirect(url_for('accounts'))


# ---------------------------------------------------------------------------
# Performance
# ---------------------------------------------------------------------------

@app.route('/performance')
@login_required
def performance():
    today = date.today()
    curr_month = today.strftime('%Y-%m')
    users = User.query.filter(User.role.in_(['sales', 'manager'])).all()
    stages = Stage.query.filter_by(active=True).order_by(Stage.order).all()
    stage_map = {s.id: s for s in stages}
    deals = Deal.query.filter_by(archived=False).all()

    rep_stats = {}
    for u in users:
        u_deals = [d for d in deals if d.assigned_to == u.id]
        won = [d for d in u_deals if d.status == 'won']
        lost = [d for d in u_deals if d.status == 'lost']
        active = [d for d in u_deals if d.status == 'open']
        rev = sum(d.closed_value or d.expected_value or 0 for d in won)
        meetings_cnt = sum(1 for d in u_deals if d.stage_id and stage_map.get(d.stage_id) and 'meeting' in stage_map[d.stage_id].name.lower())
        quotations_cnt = sum(1 for d in u_deals if d.stage_id and stage_map.get(d.stage_id) and 'quotation' in stage_map[d.stage_id].name.lower())
        opps = sum(1 for d in u_deals if d.stage_id and stage_map.get(d.stage_id) and stage_map[d.stage_id].order >= 4 and stage_map[d.stage_id].type == 'open')
        total = len(u_deals)
        qual = sum(1 for d in u_deals if d.stage_id and stage_map.get(d.stage_id) and stage_map[d.stage_id].order >= 3)
        conv = round((qual / total * 100) if total > 0 else 0, 1)
        close = round((len(won) / (len(won) + len(lost)) * 100) if (len(won) + len(lost)) > 0 else 0, 1)
        wpipe = sum((d.expected_value or 0) * (d.probability or 0) / 100 for d in active)
        overdue = sum(1 for d in active if d.follow_up_date and d.follow_up_date < today)

        target_obj = Target.query.filter_by(user_id=u.id, month=curr_month, metric='revenue').first()
        target_val = target_obj.value if target_obj else 0
        attainment = round((rev / target_val * 100) if target_val > 0 else 0, 1)

        rep_stats[u.id] = {
            'user': u,
            'total_leads': total,
            'active_deals': len(active),
            'meetings': meetings_cnt,
            'quotations': quotations_cnt,
            'opportunities': opps,
            'won': len(won),
            'lost': len(lost),
            'conversion': conv,
            'close_rate': close,
            'revenue': rev,
            'weighted_pipeline': wpipe,
            'target': target_val,
            'attainment': attainment,
            'overdue': overdue,
        }

    totals = {
        'leads': sum(s['total_leads'] for s in rep_stats.values()),
        'revenue': sum(s['revenue'] for s in rep_stats.values()),
        'closed': sum(s['won'] for s in rep_stats.values()),
    }

    return render_template('performance.html',
                           rep_stats=rep_stats,
                           users=users,
                           totals=totals)


# ---------------------------------------------------------------------------
# Targets
# ---------------------------------------------------------------------------

@app.route('/targets')
@login_required
def targets():
    month = request.args.get('month', date.today().strftime('%Y-%m'))
    rep_id = request.args.get('rep_id')
    users = User.query.filter(User.role.in_(['sales', 'manager'])).order_by(User.name).all()
    metrics = ['revenue', 'deals', 'meetings', 'quotations', 'opportunities']

    target_data = {}
    for u in users:
        target_data[u.id] = {}
        for m in metrics:
            t = Target.query.filter_by(user_id=u.id, month=month, metric=m).first()
            target_data[u.id][m] = t.value if t else 0

    # Compute actuals
    deals = Deal.query.filter_by(archived=False).all()
    stages = Stage.query.filter_by(active=True).all()
    stage_map = {s.id: s for s in stages}
    actuals = {}
    for u in users:
        u_deals = [d for d in deals if d.assigned_to == u.id]
        won = [d for d in u_deals if d.status == 'won' and d.updated_at and d.updated_at.strftime('%Y-%m') == month]
        actuals[u.id] = {
            'revenue': sum(d.closed_value or d.expected_value or 0 for d in won),
            'deals': len(won),
            'meetings': sum(1 for d in u_deals if d.stage_id and stage_map.get(d.stage_id) and 'meeting' in stage_map[d.stage_id].name.lower()),
            'quotations': sum(1 for d in u_deals if d.stage_id and stage_map.get(d.stage_id) and 'quotation' in stage_map[d.stage_id].name.lower()),
            'opportunities': sum(1 for d in u_deals if d.stage_id and stage_map.get(d.stage_id) and stage_map[d.stage_id].order >= 4),
        }

    return render_template('targets.html',
                           users=users,
                           metrics=metrics,
                           month=month,
                           target_data=target_data,
                           actuals=actuals)


@app.route('/targets/set', methods=['POST'])
@login_required
@role_required('admin', 'manager')
def targets_set():
    month = request.form.get('month', date.today().strftime('%Y-%m'))
    metrics = ['revenue', 'deals', 'meetings', 'quotations', 'opportunities']
    users = User.query.filter(User.role.in_(['sales', 'manager'])).all()
    for u in users:
        for m in metrics:
            key = f'target_{u.id}_{m}'
            val = request.form.get(key)
            if val is not None:
                t = Target.query.filter_by(user_id=u.id, month=month, metric=m).first()
                if t:
                    t.value = float(val or 0)
                else:
                    t = Target(user_id=u.id, month=month, metric=m, value=float(val or 0))
                    db.session.add(t)
    db.session.commit()
    log_audit('update', 'target', None, f'Targets set for month {month}')
    flash('Targets saved.', 'success')
    return redirect(url_for('targets', month=month))


# ---------------------------------------------------------------------------
# Import
# ---------------------------------------------------------------------------

@app.route('/import')
@login_required
@role_required('admin', 'manager')
def import_data():
    return render_template('import_data.html')


@app.route('/import/preview', methods=['POST'])
@login_required
@role_required('admin', 'manager')
def import_preview():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    f = request.files['file']
    if not f.filename.endswith(('.xlsx', '.xls', '.csv')):
        return jsonify({'error': 'Invalid file format'}), 400
    filename = secure_filename(f.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    f.save(filepath)

    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath, nrows=5)
        else:
            df = pd.read_excel(filepath, nrows=5)
        columns = list(df.columns)
        rows = df.fillna('').values.tolist()
        return jsonify({'columns': columns, 'rows': rows, 'filename': filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/import/execute', methods=['POST'])
@login_required
@role_required('admin', 'manager')
def import_execute():
    data = request.json
    filename = data.get('filename')
    mapping = data.get('mapping', {})

    if not filename:
        return jsonify({'error': 'No filename provided'}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 400

    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)
        df = df.fillna('')
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    created = 0
    updated = 0
    errors = 0
    error_messages = []

    def get_val(row, crm_field):
        col = mapping.get(crm_field)
        if col and col in df.columns:
            return str(row.get(col, '')).strip()
        return ''

    for idx, row in df.iterrows():
        try:
            title = get_val(row, 'title')
            if not title:
                errors += 1
                error_messages.append(f'Row {idx + 2}: Missing title')
                continue

            deal = Deal(
                title=title,
                contact_name=get_val(row, 'contact_name') or '',
                phone=get_val(row, 'phone') or '',
                email=get_val(row, 'email') or '',
                business_type=get_val(row, 'business_type') or '',
                source=get_val(row, 'source') or '',
                notes=get_val(row, 'notes') or '',
                priority=get_val(row, 'priority') or 'Medium',
                market=get_val(row, 'market') or '',
                status='open',
                assigned_to=current_user.id,
            )
            ev = get_val(row, 'expected_value')
            if ev:
                try:
                    deal.expected_value = float(ev)
                except Exception:
                    pass
            ecd = get_val(row, 'expected_close_date')
            if ecd:
                for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y'):
                    try:
                        deal.expected_close_date = datetime.strptime(ecd, fmt).date()
                        break
                    except ValueError:
                        continue
            db.session.add(deal)
            created += 1
        except Exception as e:
            errors += 1
            error_messages.append(f'Row {idx + 2}: {str(e)}')

    db.session.commit()
    log_audit('import', 'deal', None, f'Imported {created} deals, {errors} errors')
    return jsonify({'created': created, 'updated': updated, 'errors': errors, 'error_messages': error_messages[:20]})


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------

@app.route('/export')
@login_required
def export_data():
    return render_template('export_data.html', filters=request.args)


@app.route('/export/deals')
@login_required
def export_deals():
    q = Deal.query.filter_by(archived=False)
    if current_user.role == 'sales':
        q = q.filter(Deal.assigned_to == current_user.id)
    q = apply_deal_filters(q, request.args)
    deals = q.all()
    users = {u.id: u.name for u in User.query.all()}
    stages = {s.id: s.name for s in Stage.query.all()}
    accounts = {a.id: a.name for a in Account.query.all()}

    rows = []
    for d in deals:
        rows.append({
            'ID': d.id,
            'Title': d.title,
            'Account': accounts.get(d.account_id, ''),
            'Contact': d.contact_name,
            'Phone': d.phone,
            'Email': d.email,
            'Business Type': d.business_type,
            'Source': d.source,
            'Assigned To': users.get(d.assigned_to, ''),
            'Stage': stages.get(d.stage_id, ''),
            'Status': d.status,
            'Priority': d.priority,
            'Probability %': d.probability,
            'Expected Value': d.expected_value,
            'Closed Value': d.closed_value,
            'Expected Close Date': d.expected_close_date,
            'Follow Up Date': d.follow_up_date,
            'Market': d.market,
            'Tags': d.tags,
            'Next Action': d.next_action,
            'Notes': d.notes,
            'Created At': d.created_at,
            'Updated At': d.updated_at,
        })

    df = pd.DataFrame(rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Deals')
    output.seek(0)
    log_audit('export', 'deal', None, f'Exported {len(deals)} deals')
    return send_file(output, download_name='deals_export.xlsx',
                     as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@app.route('/export/performance')
@login_required
def export_performance():
    users = User.query.filter(User.role.in_(['sales', 'manager'])).all()
    deals = Deal.query.filter_by(archived=False).all()
    stages = Stage.query.all()
    stage_map = {s.id: s for s in stages}
    rows = []
    for u in users:
        u_deals = [d for d in deals if d.assigned_to == u.id]
        won = [d for d in u_deals if d.status == 'won']
        lost = [d for d in u_deals if d.status == 'lost']
        rev = sum(d.closed_value or d.expected_value or 0 for d in won)
        rows.append({
            'Rep': u.name,
            'Email': u.email,
            'Role': u.role,
            'Total Leads': len(u_deals),
            'Active Deals': sum(1 for d in u_deals if d.status == 'open'),
            'Won': len(won),
            'Lost': len(lost),
            'Revenue': rev,
            'Close Rate %': round((len(won) / (len(won) + len(lost)) * 100) if (len(won) + len(lost)) > 0 else 0, 1),
        })
    df = pd.DataFrame(rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Performance')
    output.seek(0)
    log_audit('export', 'performance', None, 'Exported performance report')
    return send_file(output, download_name='performance_export.xlsx',
                     as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@app.route('/export/summary')
@login_required
def export_summary():
    deals = Deal.query.filter_by(archived=False).all()
    total = len(deals)
    won = [d for d in deals if d.status == 'won']
    lost = [d for d in deals if d.status == 'lost']
    open_d = [d for d in deals if d.status == 'open']
    revenue = sum(d.closed_value or d.expected_value or 0 for d in won)
    pipeline = sum(d.expected_value or 0 for d in open_d)

    rows = [
        {'Metric': 'Total Deals', 'Value': total},
        {'Metric': 'Closed Won', 'Value': len(won)},
        {'Metric': 'Closed Lost', 'Value': len(lost)},
        {'Metric': 'Open Deals', 'Value': len(open_d)},
        {'Metric': 'Total Revenue', 'Value': revenue},
        {'Metric': 'Pipeline Value', 'Value': pipeline},
        {'Metric': 'Close Rate %', 'Value': round((len(won) / (len(won) + len(lost)) * 100) if (len(won) + len(lost)) > 0 else 0, 1)},
        {'Metric': 'Avg Deal Size', 'Value': round(revenue / len(won) if won else 0, 2)},
    ]
    df = pd.DataFrame(rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Summary')
    output.seek(0)
    log_audit('export', 'summary', None, 'Exported dashboard summary')
    return send_file(output, download_name='summary_export.xlsx',
                     as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


# ---------------------------------------------------------------------------
# Stage Settings
# ---------------------------------------------------------------------------

@app.route('/stages')
@login_required
@role_required('admin', 'manager')
def stage_settings():
    stages = Stage.query.order_by(Stage.order).all()
    return render_template('stage_settings.html', stages=stages)


@app.route('/stages/new', methods=['POST'])
@login_required
@role_required('admin', 'manager')
def stage_new():
    max_order = db.session.query(func.max(Stage.order)).scalar() or 0
    s = Stage(
        name=request.form.get('name', 'New Stage'),
        color=request.form.get('color', '#6366f1'),
        probability=int(request.form.get('probability', 50)),
        type=request.form.get('type', 'open'),
        order=max_order + 1,
        active=True,
    )
    db.session.add(s)
    db.session.commit()
    log_audit('create', 'stage', s.id, f'Stage created: {s.name}')
    flash('Stage created.', 'success')
    return redirect(url_for('stage_settings'))


@app.route('/stages/<int:stage_id>/edit', methods=['POST'])
@login_required
@role_required('admin', 'manager')
def stage_edit(stage_id):
    s = Stage.query.get_or_404(stage_id)
    s.name = request.form.get('name', s.name)
    s.color = request.form.get('color', s.color)
    s.probability = int(request.form.get('probability', s.probability))
    s.type = request.form.get('type', s.type)
    s.active = request.form.get('active', 'false') == 'true'
    db.session.commit()
    log_audit('update', 'stage', s.id, f'Stage updated: {s.name}')
    return jsonify({'ok': True})


@app.route('/stages/<int:stage_id>/delete', methods=['POST'])
@login_required
@role_required('admin')
def stage_delete(stage_id):
    s = Stage.query.get_or_404(stage_id)
    name = s.name
    db.session.delete(s)
    db.session.commit()
    log_audit('delete', 'stage', stage_id, f'Stage deleted: {name}')
    flash('Stage deleted.', 'success')
    return redirect(url_for('stage_settings'))


@app.route('/stages/reorder', methods=['POST'])
@login_required
@role_required('admin', 'manager')
def stages_reorder():
    order_data = request.json.get('order', [])
    for item in order_data:
        s = db.session.get(Stage, item['id'])
        if s:
            s.order = item['order']
    db.session.commit()
    log_audit('reorder', 'stage', None, 'Stages reordered')
    return jsonify({'ok': True})


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

@app.route('/settings', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def settings():
    if request.method == 'POST':
        keys = ['system_name', 'currency', 'date_format']
        for k in keys:
            val = request.form.get(k)
            if val is not None:
                s = Setting.query.filter_by(key=k).first()
                if s:
                    s.value = val
                else:
                    db.session.add(Setting(key=k, value=val))

        list_keys = ['markets', 'business_types', 'lead_sources', 'priorities']
        for k in list_keys:
            val = request.form.get(k, '')
            items = [x.strip() for x in val.split(',') if x.strip()]
            s = Setting.query.filter_by(key=k).first()
            if s:
                s.value = json.dumps(items)
            else:
                db.session.add(Setting(key=k, value=json.dumps(items)))

        db.session.commit()
        log_audit('update', 'setting', None, 'Settings updated')
        flash('Settings saved.', 'success')
        return redirect(url_for('settings'))

    sdict = get_settings_dict()
    list_keys = ['markets', 'business_types', 'lead_sources', 'priorities']
    lists = {}
    for k in list_keys:
        if k in sdict:
            try:
                lists[k] = ', '.join(json.loads(sdict[k]))
            except Exception:
                lists[k] = sdict.get(k, '')
        else:
            lists[k] = ''

    return render_template('settings.html', sdict=sdict, lists=lists)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@app.route('/users')
@login_required
@role_required('admin')
def users():
    all_users = User.query.order_by(User.name).all()
    return render_template('users.html', users=all_users)


@app.route('/users/new', methods=['POST'])
@login_required
@role_required('admin')
def user_new():
    f = request.form
    email = f.get('email', '').strip().lower()
    if User.query.filter_by(email=email).first():
        flash('Email already exists.', 'danger')
        return redirect(url_for('users'))
    u = User(
        email=email,
        name=f.get('name', '').strip(),
        role=f.get('role', 'sales'),
        hashed_password=generate_password_hash(f.get('password', 'Password@123')),
        active=True,
    )
    db.session.add(u)
    db.session.commit()
    log_audit('create', 'user', u.id, f'User created: {u.email}')
    flash('User created.', 'success')
    return redirect(url_for('users'))


@app.route('/users/<int:user_id>/edit', methods=['POST'])
@login_required
@role_required('admin')
def user_edit(user_id):
    u = User.query.get_or_404(user_id)
    f = request.form
    u.name = f.get('name', u.name).strip()
    u.role = f.get('role', u.role)
    if f.get('password'):
        u.hashed_password = generate_password_hash(f.get('password'))
    db.session.commit()
    log_audit('update', 'user', u.id, f'User updated: {u.email}')
    flash('User updated.', 'success')
    return redirect(url_for('users'))


@app.route('/users/<int:user_id>/delete', methods=['POST'])
@login_required
@role_required('admin')
def user_delete(user_id):
    if user_id == current_user.id:
        flash('Cannot delete your own account.', 'danger')
        return redirect(url_for('users'))
    u = User.query.get_or_404(user_id)
    email = u.email
    db.session.delete(u)
    db.session.commit()
    log_audit('delete', 'user', user_id, f'User deleted: {email}')
    flash('User deleted.', 'success')
    return redirect(url_for('users'))


@app.route('/users/<int:user_id>/toggle', methods=['POST'])
@login_required
@role_required('admin')
def user_toggle(user_id):
    u = User.query.get_or_404(user_id)
    u.active = not u.active
    db.session.commit()
    log_audit('toggle', 'user', u.id, f'User {"activated" if u.active else "deactivated"}: {u.email}')
    flash(f'User {"activated" if u.active else "deactivated"}.', 'info')
    return redirect(url_for('users'))


# ---------------------------------------------------------------------------
# Audit Logs
# ---------------------------------------------------------------------------

@app.route('/audit')
@login_required
@role_required('admin', 'manager')
def audit_logs():
    page = int(request.args.get('page', 1))
    per_page = 50
    q = AuditLog.query
    if request.args.get('user_id'):
        q = q.filter(AuditLog.user_id == int(request.args.get('user_id')))
    if request.args.get('action'):
        q = q.filter(AuditLog.action == request.args.get('action'))
    if request.args.get('date_from'):
        try:
            q = q.filter(AuditLog.timestamp >= datetime.strptime(request.args.get('date_from'), '%Y-%m-%d'))
        except ValueError:
            pass
    if request.args.get('date_to'):
        try:
            q = q.filter(AuditLog.timestamp <= datetime.strptime(request.args.get('date_to'), '%Y-%m-%d') + timedelta(days=1))
        except ValueError:
            pass
    total = q.count()
    logs = q.order_by(AuditLog.timestamp.desc()).offset((page - 1) * per_page).limit(per_page).all()
    users = User.query.all()
    user_map = {u.id: u for u in users}
    actions = db.session.query(AuditLog.action).distinct().all()
    return render_template('audit_logs.html',
                           logs=logs,
                           users=users,
                           user_map=user_map,
                           actions=[a[0] for a in actions],
                           total=total,
                           page=page,
                           per_page=per_page,
                           total_pages=(total + per_page - 1) // per_page,
                           filters=request.args)


# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------

@app.errorhandler(403)
def forbidden(e):
    return render_template('base.html', error_code=403,
                           error_msg='You do not have permission to access this page.'), 403


@app.errorhandler(404)
def not_found(e):
    return render_template('base.html', error_code=404,
                           error_msg='Page not found.'), 404


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
