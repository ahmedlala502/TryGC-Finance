import { all, get } from "@/lib/db";

function parseListSetting(value, fallback = []) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function parseStage(stage) {
  return {
    ...stage,
    active: Boolean(stage.active)
  };
}

function parseCustomField(field) {
  return {
    ...field,
    options: parseListSetting(field.options, [])
  };
}

function buildDealFilterSql(user, filters = {}, alias = "d") {
  const conditions = [`${alias}.archived = 0`];
  const params = [];

  if (user?.role === "sales") {
    conditions.push(`${alias}.assigned_to = ?`);
    params.push(user.id);
  }

  if (filters.search) {
    conditions.push(
      `(${alias}.title like ? or coalesce(${alias}.contact_name, '') like ? or coalesce(${alias}.email, '') like ?)`
    );
    const query = `%${String(filters.search).trim()}%`;
    params.push(query, query, query);
  }

  if (filters.status) {
    conditions.push(`${alias}.status = ?`);
    params.push(filters.status);
  }

  if (filters.stageId) {
    conditions.push(`${alias}.stage_id = ?`);
    params.push(Number(filters.stageId));
  }

  if (filters.ownerId && user?.role !== "sales") {
    conditions.push(`${alias}.assigned_to = ?`);
    params.push(Number(filters.ownerId));
  }

  return {
    clause: `where ${conditions.join(" and ")}`,
    params
  };
}

export function getActiveUsers() {
  return all(
    "select id, name, email, role from users where active = 1 order by case role when 'admin' then 1 when 'manager' then 2 when 'sales' then 3 else 4 end, name"
  );
}

export function listUsers() {
  return all(`
    select
      u.id,
      u.name,
      u.email,
      u.role,
      u.active,
      u.created_at,
      u.last_login,
      count(d.id) as total_deals,
      coalesce(sum(case when d.status = 'won' then coalesce(d.closed_value, d.expected_value, 0) else 0 end), 0) as won_value
    from users u
    left join deals d on d.assigned_to = u.id and d.archived = 0
    group by u.id, u.name, u.email, u.role, u.active, u.created_at, u.last_login
    order by case u.role when 'admin' then 1 when 'manager' then 2 when 'sales' then 3 else 4 end, u.name
  `).map((row) => ({
    ...row,
    active: Boolean(row.active)
  }));
}

export function listStages() {
  return all(
    "select id, name, color, probability, type, active, `order` from stages order by `order`, id"
  ).map(parseStage);
}

export function getActiveStages() {
  return listStages().filter((stage) => stage.active);
}

export function listCustomFields(entityType = null) {
  const rows = entityType
    ? all(
        "select id, entity_type, name, field_type, options from custom_fields where entity_type = ? order by entity_type, name",
        entityType
      )
    : all("select id, entity_type, name, field_type, options from custom_fields order by entity_type, name");
  return rows.map(parseCustomField);
}

export function getCustomFieldDefinitions(entityType) {
  return listCustomFields(entityType);
}

export function getCustomFieldValues(entityType, entityId) {
  const fields = getCustomFieldDefinitions(entityType);
  if (!fields.length) return [];

  const valueRows = all(
    `
      select cfv.custom_field_id, cfv.value
      from custom_field_values cfv
      join custom_fields cf on cf.id = cfv.custom_field_id
      where cf.entity_type = ? and cfv.entity_id = ?
    `,
    entityType,
    entityId
  );

  const valuesByFieldId = new Map(valueRows.map((row) => [Number(row.custom_field_id), row.value ?? ""]));
  return fields.map((field) => ({
    ...field,
    value: valuesByFieldId.get(field.id) ?? ""
  }));
}

export function getDashboardSummary(user) {
  const { clause, params } = buildDealFilterSql(user);
  const totals = get(
    `
      select
        count(*) as total_deals,
        sum(case when status = 'open' then 1 else 0 end) as open_deals,
        sum(case when status = 'won' then 1 else 0 end) as won_deals,
        sum(case when status = 'lost' then 1 else 0 end) as lost_deals,
        coalesce(sum(case when status = 'open' then expected_value else 0 end), 0) as pipeline_value,
        coalesce(sum(case when status = 'won' then coalesce(closed_value, expected_value, 0) else 0 end), 0) as won_value
      from deals d
      ${clause}
    `,
    ...params
  );

  const recentDeals = all(
    `
      select
        d.id,
        d.title,
        d.status,
        d.expected_value,
        d.updated_at,
        a.name as account_name,
        s.name as stage_name,
        s.color as stage_color
      from deals d
      left join accounts a on a.id = d.account_id
      left join stages s on s.id = d.stage_id
      ${clause}
      order by d.updated_at desc
      limit 8
    `,
    ...params
  );

  const upcomingFollowUps = all(
    `
      select
        d.id,
        d.title,
        d.follow_up_date,
        d.priority,
        a.name as account_name
      from deals d
      left join accounts a on a.id = d.account_id
      ${clause} and d.follow_up_date is not null
      order by d.follow_up_date asc
      limit 6
    `,
    ...params
  );

  const stageSummary = all(
    `
      select
        s.id,
        s.name,
        s.color,
        count(d.id) as deal_count,
        coalesce(sum(d.expected_value), 0) as stage_value
      from stages s
      left join deals d on d.stage_id = s.id and d.archived = 0 ${
        user?.role === "sales" ? "and d.assigned_to = ?" : ""
      }
      where s.active = 1
      group by s.id, s.name, s.color, s.\`order\`
      order by s.\`order\`
    `,
    ...(user?.role === "sales" ? [user.id] : [])
  );

  const health = get(
    `
      select
        coalesce(avg(case when status = 'open' then expected_value end), 0) as average_open_value,
        coalesce(sum(case when status in ('won', 'lost') then 1 else 0 end), 0) as closed_deals,
        coalesce(sum(case when status = 'won' then 1 else 0 end), 0) as won_closed_deals,
        coalesce(sum(case when status = 'open' and follow_up_date is not null and date(follow_up_date) < date('now') then 1 else 0 end), 0) as overdue_follow_ups,
        coalesce(sum(case when status = 'open' and follow_up_date is not null and date(follow_up_date) = date('now') then 1 else 0 end), 0) as due_today,
        coalesce(sum(case when status = 'open' and priority = 'High' then 1 else 0 end), 0) as high_priority_open
      from deals d
      ${clause}
    `,
    ...params
  );

  const winRate =
    Number(health.closed_deals) > 0
      ? Math.round((Number(health.won_closed_deals) / Number(health.closed_deals)) * 100)
      : 0;

  const topPerformers =
    user?.role === "sales"
      ? []
      : all(`
          select
            u.id,
            u.name,
            count(d.id) as won_deals,
            coalesce(sum(coalesce(d.closed_value, d.expected_value, 0)), 0) as won_value
          from users u
          left join deals d on d.assigned_to = u.id and d.archived = 0 and d.status = 'won'
          where u.active = 1 and u.role in ('admin', 'manager', 'sales')
          group by u.id, u.name
          order by won_value desc, won_deals desc
          limit 5
        `);

  return {
    totals,
    health: {
      averageOpenValue: Number(health.average_open_value || 0),
      overdueFollowUps: Number(health.overdue_follow_ups || 0),
      dueToday: Number(health.due_today || 0),
      highPriorityOpen: Number(health.high_priority_open || 0),
      winRate
    },
    recentDeals,
    stageSummary,
    upcomingFollowUps,
    topPerformers
  };
}

export function listDeals(user, filters = {}) {
  const { clause, params } = buildDealFilterSql(user, filters);
  return all(
    `
      select
        d.*,
        a.name as account_name,
        s.name as stage_name,
        s.color as stage_color,
        u.name as assignee_name
      from deals d
      left join accounts a on a.id = d.account_id
      left join stages s on s.id = d.stage_id
      left join users u on u.id = d.assigned_to
      ${clause}
      order by d.updated_at desc
    `,
    ...params
  );
}

export function listDealsByStage(user, filters = {}) {
  const stages = getActiveStages();
  const deals = listDeals(user, { ...filters, status: "open" }).filter((deal) => deal.status === "open");
  return stages
    .filter((stage) => stage.type === "open")
    .map((stage) => ({
      ...stage,
      deals: deals.filter((deal) => deal.stage_id === stage.id)
    }));
}

export function getDealById(user, dealId) {
  const deal = get(
    `
      select
        d.*,
        a.name as account_name,
        s.name as stage_name,
        u.name as assignee_name
      from deals d
      left join accounts a on a.id = d.account_id
      left join stages s on s.id = d.stage_id
      left join users u on u.id = d.assigned_to
      where d.id = ?
    `,
    dealId
  );

  if (!deal) return null;
  if (user?.role === "sales" && deal.assigned_to !== user.id) {
    return null;
  }

  const auditEntries = all(
    `
      select
        l.id,
        l.action,
        l.detail,
        l.timestamp,
        u.name as user_name
      from audit_logs l
      left join users u on u.id = l.user_id
      where l.entity_type = 'deal' and l.entity_id = ?
      order by l.timestamp desc
      limit 20
    `,
    dealId
  );

  return {
    deal,
    auditEntries,
    customFields: getCustomFieldValues("deal", dealId)
  };
}

export function listAccounts(user, filters = {}) {
  const conditions = [];
  const params = [];

  if (user?.role === "sales") {
    conditions.push("coalesce(a.assigned_to, 0) = ?");
    params.push(user.id);
  }

  if (filters.search) {
    conditions.push("(a.name like ? or coalesce(a.industry, '') like ? or coalesce(a.contact_name, '') like ?)");
    const query = `%${String(filters.search).trim()}%`;
    params.push(query, query, query);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  return all(
    `
      select
        a.*,
        u.name as assignee_name,
        count(d.id) as active_deals
      from accounts a
      left join users u on u.id = a.assigned_to
      left join deals d on d.account_id = a.id and d.archived = 0
      ${where}
      group by a.id, u.name
      order by a.created_at desc
    `,
    ...params
  );
}

export function getAccountById(user, accountId) {
  const account = get(
    `
      select
        a.*,
        u.name as assignee_name
      from accounts a
      left join users u on u.id = a.assigned_to
      where a.id = ?
    `,
    accountId
  );

  if (!account) return null;
  if (user?.role === "sales" && account.assigned_to !== user.id) {
    return null;
  }

  const deals = all(
    `
      select id, title, status, expected_value, updated_at
      from deals
      where account_id = ? and archived = 0
      order by updated_at desc
    `,
    accountId
  );

  return {
    account,
    deals,
    customFields: getCustomFieldValues("account", accountId)
  };
}

export function getPerformanceRows() {
  return all(`
    select
      u.id,
      u.name,
      u.email,
      u.role,
      count(d.id) as total_deals,
      sum(case when d.status = 'open' then 1 else 0 end) as open_deals,
      sum(case when d.status = 'won' then 1 else 0 end) as won_deals,
      sum(case when d.status = 'lost' then 1 else 0 end) as lost_deals,
      coalesce(sum(case when d.status = 'won' then coalesce(d.closed_value, d.expected_value, 0) else 0 end), 0) as revenue
    from users u
    left join deals d on d.assigned_to = u.id and d.archived = 0
    where u.active = 1 and u.role in ('admin', 'manager', 'sales')
    group by u.id, u.name, u.email, u.role
    order by revenue desc, u.name
  `).map((row) => {
    const closed = Number(row.won_deals || 0) + Number(row.lost_deals || 0);
    return {
      ...row,
      close_rate: closed ? (Number(row.won_deals || 0) / closed) * 100 : 0
    };
  });
}

export function getAuditEntries(limit = 50) {
  return all(
    `
      select
        l.id,
        l.action,
        l.entity_type,
        l.entity_id,
        l.detail,
        l.timestamp,
        u.name as user_name
      from audit_logs l
      left join users u on u.id = l.user_id
      order by l.timestamp desc
      limit ?
    `,
    limit
  );
}

export function getTargets(month) {
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const rows = all(
    `
      select
        t.id,
        t.month,
        t.metric,
        t.value,
        u.id as user_id,
        u.name as user_name,
        u.role
      from targets t
      join users u on u.id = t.user_id
      where t.month = ?
      order by u.name, t.metric
    `,
    targetMonth
  );

  return {
    month: targetMonth,
    rows,
    users: getActiveUsers().filter((user) => ["sales", "manager"].includes(user.role))
  };
}

export function getSettingsMap() {
  const rows = all("select key, value from settings order by key");
  const map = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export function getWorkspaceConfig() {
  const settings = getSettingsMap();
  return {
    system_name: settings.system_name || "TryGc - Finance & Sales Dashboard",
    currency: settings.currency || "USD",
    date_format: settings.date_format || "%Y-%m-%d",
    markets: parseListSetting(settings.markets, ["Local", "International", "MENA", "Europe"]),
    business_types: parseListSetting(settings.business_types, ["Software", "Hardware", "Services", "Consulting", "Training"]),
    lead_sources: parseListSetting(settings.lead_sources, ["Website", "Referral", "LinkedIn", "Cold Call", "Event", "Email Campaign"]),
    priorities: parseListSetting(settings.priorities, ["Low", "Medium", "High", "Critical"])
  };
}
