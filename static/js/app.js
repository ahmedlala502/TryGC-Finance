/* =====================================================================
   TryGc - Finance & Sales Dashboard - Main JavaScript
   ===================================================================== */

/* ---- Sidebar Toggle ---- */
(function () {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');

  if (!sidebar) return;

  function isMobile() { return window.innerWidth <= 768; }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      if (isMobile()) {
        sidebar.classList.toggle('mobile-open');
        if (mobileOverlay) mobileOverlay.classList.toggle('hidden');
      } else {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function () {
      sidebar.classList.remove('mobile-open');
      mobileOverlay.classList.add('hidden');
    });
  }

  // Restore collapsed state
  if (!isMobile() && localStorage.getItem('sidebar-collapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }

  window.addEventListener('resize', function () {
    if (!isMobile()) {
      sidebar.classList.remove('mobile-open');
      if (mobileOverlay) mobileOverlay.classList.add('hidden');
    }
  });
})();

/* ---- Flash Message Auto-dismiss ---- */
(function () {
  function dismissFlash(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'opacity 0.4s, transform 0.4s';
    setTimeout(function () { el.remove(); }, 420);
  }

  document.querySelectorAll('.flash').forEach(function (el) {
    const closeBtn = el.querySelector('.flash-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { dismissFlash(el); });
    setTimeout(function () { dismissFlash(el); }, 5000);
  });

  // MutationObserver to catch dynamically added flash messages
  const flashContainer = document.getElementById('flashContainer');
  if (flashContainer) {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.classList && node.classList.contains('flash')) {
            const closeBtn = node.querySelector('.flash-close');
            if (closeBtn) closeBtn.addEventListener('click', function () { dismissFlash(node); });
            setTimeout(function () { dismissFlash(node); }, 5000);
          }
        });
      });
    }).observe(flashContainer, { childList: true });
  }
})();

/* ---- Confirm dialogs for destructive actions ---- */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-confirm]');
  if (btn) {
    const msg = btn.getAttribute('data-confirm') || 'Are you sure?';
    if (!confirm(msg)) { e.preventDefault(); }
  }
});

/* ---- Dashboard filter auto-submit on change ---- */
(function () {
  const filterForm = document.getElementById('dashboardFilterForm');
  if (!filterForm) return;

  filterForm.querySelectorAll('select').forEach(function (sel) {
    sel.addEventListener('change', function () {
      filterForm.submit();
    });
  });
})();

/* ---- Pipeline Table: Bulk selection ---- */
(function () {
  const selectAll = document.getElementById('selectAll');
  const bulkBar = document.getElementById('bulkBar');
  const bulkCount = document.getElementById('bulkCount');
  const bulkIdsInput = document.getElementById('bulkIdsInput');

  function getChecked() {
    return Array.from(document.querySelectorAll('.deal-checkbox:checked'));
  }

  function updateBulkBar() {
    const checked = getChecked();
    if (checked.length > 0) {
      bulkBar && bulkBar.classList.remove('hidden');
      if (bulkCount) bulkCount.textContent = checked.length + ' deal' + (checked.length > 1 ? 's' : '') + ' selected';
    } else {
      bulkBar && bulkBar.classList.add('hidden');
    }
  }

  if (selectAll) {
    selectAll.addEventListener('change', function () {
      document.querySelectorAll('.deal-checkbox').forEach(function (cb) {
        cb.checked = selectAll.checked;
        cb.closest('tr') && cb.closest('tr').classList.toggle('selected', cb.checked);
      });
      updateBulkBar();
    });
  }

  document.querySelectorAll('.deal-checkbox').forEach(function (cb) {
    cb.addEventListener('change', function () {
      cb.closest('tr') && cb.closest('tr').classList.toggle('selected', cb.checked);
      const allChecked = document.querySelectorAll('.deal-checkbox');
      if (selectAll) selectAll.checked = [...allChecked].every(function (c) { return c.checked; });
      updateBulkBar();
    });
  });

  // Bulk action buttons
  document.querySelectorAll('.bulk-action-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const action = btn.getAttribute('data-action');
      const checked = getChecked();
      if (!checked.length) return;

      const form = document.getElementById('bulkForm');
      if (!form) return;

      // Remove old hidden inputs
      form.querySelectorAll('input[name="deal_ids"]').forEach(function (el) { el.remove(); });

      checked.forEach(function (cb) {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = 'deal_ids';
        inp.value = cb.value;
        form.appendChild(inp);
      });

      form.querySelector('input[name="action"]').value = action;

      if (action === 'move_stage') {
        const stageId = document.getElementById('bulkStageSelect') ? document.getElementById('bulkStageSelect').value : '';
        if (!stageId) { alert('Please select a stage first.'); return; }
        form.querySelector('input[name="new_stage_id"]').value = stageId;
      }

      if (action === 'delete') {
        if (!confirm('Delete selected deals? This cannot be undone.')) return;
      }

      form.submit();
    });
  });
})();

/* ---- Kanban Drag & Drop ---- */
(function () {
  let draggedCard = null;
  let draggedId = null;

  document.querySelectorAll('.kanban-card').forEach(function (card) {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', function (e) {
      draggedCard = card;
      draggedId = card.getAttribute('data-deal-id');
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      draggedCard = null;
    });
  });

  document.querySelectorAll('.kanban-cards').forEach(function (col) {
    col.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', function () {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', function (e) {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (!draggedId) return;

      const newStageId = col.getAttribute('data-stage-id');
      const oldStageId = draggedCard && draggedCard.getAttribute('data-stage-id');

      if (newStageId === oldStageId) {
        col.appendChild(draggedCard);
        return;
      }

      col.appendChild(draggedCard);
      draggedCard.setAttribute('data-stage-id', newStageId);

      // Update column counts
      updateKanbanColumnMeta();

      // POST to server
      fetch('/deals/' + draggedId + '/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        body: 'stage_id=' + encodeURIComponent(newStageId),
      }).then(function (r) {
        if (!r.ok) {
          showToast('Failed to update deal stage.', 'danger');
        }
      }).catch(function () {
        showToast('Network error updating stage.', 'danger');
      });
    });
  });

  function updateKanbanColumnMeta() {
    document.querySelectorAll('.kanban-column').forEach(function (col) {
      const cards = col.querySelectorAll('.kanban-card').length;
      const countEl = col.querySelector('.kanban-count');
      if (countEl) countEl.textContent = cards + ' deal' + (cards !== 1 ? 's' : '');
    });
  }
})();

/* ---- Stage Settings Drag-to-Reorder ---- */
(function () {
  const list = document.getElementById('stageList');
  if (!list) return;

  let draggingEl = null;

  list.querySelectorAll('.stage-row').forEach(addDragListeners);

  function addDragListeners(row) {
    const handle = row.querySelector('.drag-handle');
    if (handle) {
      handle.addEventListener('mousedown', function () {
        row.setAttribute('draggable', 'true');
      });
      handle.addEventListener('mouseup', function () {
        row.setAttribute('draggable', 'false');
      });
    }

    row.addEventListener('dragstart', function (e) {
      draggingEl = row;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', function () {
      row.classList.remove('dragging');
      draggingEl = null;
      saveStageOrder();
    });

    row.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (!draggingEl || draggingEl === row) return;
      const rect = row.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        list.insertBefore(draggingEl, row);
      } else {
        list.insertBefore(draggingEl, row.nextSibling);
      }
    });
  }

  function saveStageOrder() {
    const rows = list.querySelectorAll('.stage-row');
    const order = Array.from(rows).map(function (r, i) {
      return { id: parseInt(r.getAttribute('data-stage-id')), order: i + 1 };
    });

    fetch('/stages/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: order }),
    }).then(function (r) {
      if (r.ok) { showToast('Stage order saved.', 'success'); }
    });
  }

  // Inline edit save for each stage row
  list.querySelectorAll('.stage-save-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const row = btn.closest('.stage-row');
      const stageId = row.getAttribute('data-stage-id');
      const name = row.querySelector('input[name="name"]') ? row.querySelector('input[name="name"]').value : '';
      const color = row.querySelector('input[name="color"]') ? row.querySelector('input[name="color"]').value : '';
      const probability = row.querySelector('input[name="probability"]') ? row.querySelector('input[name="probability"]').value : '';
      const type = row.querySelector('select[name="type"]') ? row.querySelector('select[name="type"]').value : '';
      const active = row.querySelector('input[name="active"]') ? (row.querySelector('input[name="active"]').checked ? 'true' : 'false') : 'true';

      fetch('/stages/' + stageId + '/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'name=' + encodeURIComponent(name) +
              '&color=' + encodeURIComponent(color) +
              '&probability=' + encodeURIComponent(probability) +
              '&type=' + encodeURIComponent(type) +
              '&active=' + encodeURIComponent(active),
      }).then(function (r) {
        if (r.ok) {
          showToast('Stage saved.', 'success');
          // Update color dot
          const dot = row.querySelector('.kanban-color-dot');
          if (dot) dot.style.background = color;
        }
      });
    });
  });
})();

/* ---- Import File Upload Flow ---- */
(function () {
  const dropzone = document.getElementById('importDropzone');
  const fileInput = document.getElementById('importFile');
  const step1 = document.getElementById('importStep1');
  const step2 = document.getElementById('importStep2');
  const step3 = document.getElementById('importStep3');
  const previewTable = document.getElementById('previewTable');
  const mappingSection = document.getElementById('mappingSection');
  const importBtn = document.getElementById('executeImportBtn');
  let uploadedFilename = null;
  let uploadedColumns = [];

  const CRM_FIELDS = [
    { value: '', label: '-- Skip --' },
    { value: 'title', label: 'Deal Title' },
    { value: 'contact_name', label: 'Contact Name' },
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'business_type', label: 'Business Type' },
    { value: 'source', label: 'Lead Source' },
    { value: 'expected_value', label: 'Expected Value' },
    { value: 'expected_close_date', label: 'Expected Close Date' },
    { value: 'notes', label: 'Notes' },
    { value: 'priority', label: 'Priority' },
    { value: 'market', label: 'Market' },
  ];

  if (!dropzone) return;

  dropzone.addEventListener('click', function () { fileInput && fileInput.click(); });
  dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('drag-over'); });
  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) { uploadFile(e.dataTransfer.files[0]); }
  });

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (fileInput.files[0]) { uploadFile(fileInput.files[0]); }
    });
  }

  function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    dropzone.innerHTML = '<div class="dropzone-icon">⏳</div><div class="dropzone-title">Uploading...</div>';

    fetch('/import/preview', { method: 'POST', body: formData })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) {
          showToast(data.error, 'danger');
          resetDropzone();
          return;
        }
        uploadedFilename = data.filename;
        uploadedColumns = data.columns;
        showPreview(data.columns, data.rows);
      })
      .catch(function () {
        showToast('Upload failed.', 'danger');
        resetDropzone();
      });
  }

  function resetDropzone() {
    if (dropzone) dropzone.innerHTML = '<div class="dropzone-icon">📁</div><div class="dropzone-title">Drag & drop your Excel file here</div><div class="dropzone-sub">or click to browse (.xlsx, .xls, .csv)</div>';
  }

  function showPreview(columns, rows) {
    if (!step1 || !step2) return;
    step1.classList.add('hidden');
    step2.classList.remove('hidden');

    // Build preview table
    if (previewTable) {
      let html = '<thead><tr>' + columns.map(function (c) { return '<th>' + escHtml(c) + '</th>'; }).join('') + '</tr></thead>';
      html += '<tbody>';
      rows.forEach(function (row) {
        html += '<tr>' + row.map(function (cell) { return '<td>' + escHtml(String(cell)) + '</td>'; }).join('') + '</tr>';
      });
      html += '</tbody>';
      previewTable.innerHTML = html;
    }

    // Build mapping section
    if (mappingSection) {
      let html = '<div class="form-section-title">Map Excel Columns to CRM Fields</div>';
      html += '<div class="form-row">';
      columns.forEach(function (col) {
        html += '<div class="form-group">';
        html += '<label>' + escHtml(col) + '</label>';
        html += '<select class="col-mapping" data-col="' + escHtml(col) + '">';
        // Auto-guess
        const lower = col.toLowerCase().replace(/\s/g, '_');
        CRM_FIELDS.forEach(function (f) {
          const selected = (f.value && lower.includes(f.value)) ? ' selected' : '';
          html += '<option value="' + f.value + '"' + selected + '>' + f.label + '</option>';
        });
        html += '</select></div>';
      });
      html += '</div>';
      mappingSection.innerHTML = html;
    }
  }

  if (importBtn) {
    importBtn.addEventListener('click', function () {
      const mapping = {};
      document.querySelectorAll('.col-mapping').forEach(function (sel) {
        if (sel.value) { mapping[sel.value] = sel.getAttribute('data-col'); }
      });

      if (!mapping.title) {
        showToast('Please map the "Deal Title" column.', 'warning');
        return;
      }

      importBtn.disabled = true;
      importBtn.textContent = 'Importing...';

      fetch('/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: uploadedFilename, mapping: mapping }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.error) {
            showToast(data.error, 'danger');
            importBtn.disabled = false;
            importBtn.textContent = 'Import Data';
            return;
          }
          showImportResult(data);
          if (step2) step2.classList.add('hidden');
          if (step3) step3.classList.remove('hidden');
        })
        .catch(function () {
          showToast('Import failed.', 'danger');
          importBtn.disabled = false;
          importBtn.textContent = 'Import Data';
        });
    });
  }

  function showImportResult(data) {
    const resultEl = document.getElementById('importResult');
    if (!resultEl) return;
    let html = '<div class="d-flex gap-3 mb-4">';
    html += '<div class="kpi-card success" style="flex:1;animation:none"><div class="kpi-value">' + data.created + '</div><div class="kpi-sub">Created</div></div>';
    html += '<div class="kpi-card warning" style="flex:1;animation:none"><div class="kpi-value">' + data.updated + '</div><div class="kpi-sub">Updated</div></div>';
    html += '<div class="kpi-card danger" style="flex:1;animation:none"><div class="kpi-value">' + data.errors + '</div><div class="kpi-sub">Errors</div></div>';
    html += '</div>';
    if (data.error_messages && data.error_messages.length) {
      html += '<div class="card card-body"><strong>Errors:</strong><ul style="margin-top:8px">';
      data.error_messages.forEach(function (e) { html += '<li>' + escHtml(e) + '</li>'; });
      html += '</ul></div>';
    }
    resultEl.innerHTML = html;
  }

  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();

/* ---- Tag Inputs (Settings) ---- */
(function () {
  document.querySelectorAll('.tag-input-wrapper').forEach(function (wrapper) {
    const field = wrapper.querySelector('.tag-input-field');
    const hidden = wrapper.nextElementSibling;
    if (!field || !hidden) return;

    function getTags() {
      return Array.from(wrapper.querySelectorAll('.tag-chip')).map(function (c) {
        return c.getAttribute('data-value');
      });
    }

    function renderTag(value) {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.setAttribute('data-value', value);
      chip.innerHTML = escHtml(value) + '<button type="button" class="tag-chip-remove" aria-label="Remove">×</button>';
      chip.querySelector('.tag-chip-remove').addEventListener('click', function () {
        chip.remove();
        hidden.value = getTags().join(',');
      });
      wrapper.insertBefore(chip, field);
    }

    function escHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Init from hidden field
    if (hidden.value) {
      hidden.value.split(',').forEach(function (v) { v = v.trim(); if (v) renderTag(v); });
    }

    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = field.value.trim().replace(/,$/, '');
        if (val) {
          renderTag(val);
          field.value = '';
          hidden.value = getTags().join(',');
        }
      } else if (e.key === 'Backspace' && !field.value) {
        const chips = wrapper.querySelectorAll('.tag-chip');
        if (chips.length) {
          chips[chips.length - 1].remove();
          hidden.value = getTags().join(',');
        }
      }
    });
  });
})();

/* ---- Show Toast helper ---- */
function showToast(message, type) {
  type = type || 'info';
  const container = document.getElementById('flashContainer');
  if (!container) return;

  const iconMap = { success: '✓', danger: '✕', warning: '⚠', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = 'flash flash-' + type;
  el.innerHTML = '<span>' + (iconMap[type] || '') + '</span><span>' + message + '</span><button class="flash-close" aria-label="Close">×</button>';

  el.querySelector('.flash-close').addEventListener('click', function () { el.remove(); });
  container.appendChild(el);
  setTimeout(function () {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.4s';
    setTimeout(function () { el.remove(); }, 420);
  }, 5000);
}

/* ---- Inline edit toggle (deal detail) ---- */
(function () {
  const editToggle = document.getElementById('toggleEditBtn');
  const dealForm = document.getElementById('dealForm');
  if (!editToggle || !dealForm) return;

  let editing = false;

  editToggle.addEventListener('click', function () {
    editing = !editing;
    dealForm.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.name !== 'csrf_token') el.disabled = !editing;
    });
    editToggle.textContent = editing ? 'Cancel Edit' : 'Edit Deal';
    dealForm.querySelector('.form-actions') && (dealForm.querySelector('.form-actions').style.display = editing ? 'flex' : 'none');
  });

  // Start with form disabled
  dealForm.querySelectorAll('input, select, textarea').forEach(function (el) { el.disabled = true; });
  const formActions = dealForm.querySelector('.form-actions');
  if (formActions) formActions.style.display = 'none';
})();

/* ---- Date pickers default value = today ---- */
document.querySelectorAll('input[type="date"].default-today').forEach(function (el) {
  if (!el.value) {
    el.value = new Date().toISOString().slice(0, 10);
  }
});

/* ---- Auto-format currency inputs ---- */
document.querySelectorAll('input.currency-input').forEach(function (el) {
  el.addEventListener('blur', function () {
    const val = parseFloat(el.value.replace(/[^0-9.]/g, ''));
    if (!isNaN(val)) el.value = val.toFixed(2);
  });
});

/* ---- Topbar search redirect ---- */
(function () {
  const searchInput = document.getElementById('topbarSearch');
  if (!searchInput) return;
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) window.location.href = '/deals?search=' + encodeURIComponent(q);
    }
  });
})();
