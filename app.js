/* ============================================================
   CSP Capital Settlement Portal — App Logic
   Sidebar & Horizontal Tabs Navigation
   ============================================================ */

(function () {
  'use strict';

  let currentRole = 'investor';
  let increaseCount = 1;
  let currentSijil = '';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const show = (el) => el && el.classList.remove('hidden');
  const hide = (el) => el && el.classList.add('hidden');

  // --- Screen Navigation ---
  window.navigateTo = function (screenId) {
    $$('.main-content .screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      target.style.animation = 'none'; target.offsetHeight; target.style.animation = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update Sidebar Tabs
      $$('.vertical-tab').forEach(t => t.classList.remove('active'));
      const activeTab = document.querySelector(`.vertical-tab[data-target="${screenId}"]`);
      if (activeTab) {
        activeTab.classList.add('active');
        // Mark previous tabs as completed
        let found = false;
        $$('#investor-steps .vertical-tab').forEach(t => {
          if (t === activeTab) found = true;
          if (!found) t.classList.add('completed');
          else t.classList.remove('completed');
        });
      }
    }
  };

  // --- Sidebar Clicks ---
  $$('.vertical-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const target = this.dataset.target;
      if (target) navigateTo(target);
    });
  });

  // --- Login ---
  const loginForm = $('#login-form');
  const roleTabs = $$('.login-role-tab');
  roleTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      roleTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentRole = this.dataset.role;
    });
  });

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = $('#login-username').value.trim();
    if (!username) return;

    hide($('#screen-login'));
    show($('#app-layout'));
    $('#nav-user-name').textContent = username;
    $('#nav-user-avatar').textContent = username.charAt(0).toUpperCase();

    if (currentRole === 'employee') {
      $('#nav-user-role').textContent = 'موظف مصر المقاصة';
      hide($('#investor-sidebar'));
      show($('#employee-sidebar'));
      navigateTo('screen-employee');
    } else {
      $('#nav-user-role').textContent = 'مستثمر';
      // Instead of going directly to company screen, show the Sijil search popup
      hide($('#investor-sidebar'));
      hide($('#employee-sidebar'));
      $('#sijil-modal').classList.add('active');
    }
  });

  // --- Sijil Search ---
  $('#btn-search-sijil')?.addEventListener('click', function() {
    const sijilVal = $('#sijil-input').value.trim();
    if (!sijilVal) return;

    currentSijil = sijilVal; // Store the Sijil number for the check phase

    // Simulate search
    this.innerHTML = '<span class="spinner" style="border-color:var(--white); border-top-color:transparent;"></span> جاري البحث...';
    setTimeout(() => {
      this.innerHTML = 'بحث';
      $('#sijil-modal').classList.remove('active');
      
      // Always go to the company data screen first
      show($('#investor-sidebar'));
      navigateTo('screen-company');
      
      // Reset the check area in case it's not the first time
      const checkBtn = $('#btn-check-company');
      if (checkBtn) {
        checkBtn.disabled = false;
        checkBtn.innerHTML = 'فحص البيانات';
        checkBtn.classList.remove('hidden');
      }
      hide($('#check-result'));
      hide($('#btn-goto-delegate'));

    }, 800);
  });

  $('#logout-btn').addEventListener('click', function () {
    hide($('#app-layout'));
    show($('#screen-login'));
  });

  // --- Buttons ---
  $('#btn-check-company')?.addEventListener('click', function () {
    this.disabled = true;
    this.innerHTML = '<span class="spinner"></span> جاري الفحص...';
    setTimeout(() => {
      this.disabled = false;
      this.classList.add('hidden');
      
      if (currentSijil === '123' || currentSijil === '١٢٣') {
        // الشركة تمام (مكتملة)
        $('#check-result').innerHTML = '<div class="alert alert-success"><div class="alert-content"><div class="alert-title">حالة الشركة: مكتملة التسوية</div><div class="alert-text">لا توجد تسويات مطلوبة. سيتم توجيهك لخدمات الشركة...</div></div></div>';
        show($('#check-result'));
        
        setTimeout(() => {
          hide($('#investor-sidebar'));
          navigateTo('screen-coming-soon');
        }, 1800);
        
      } else {
        // الشركة مش تمام (تحتاج تسوية)
        $('#check-result').innerHTML = '<div class="alert alert-warning"><div class="alert-content"><div class="alert-title">الشركة غير مكتملة</div><div class="alert-text">الشركة في حاجة إلى تسوية رأس المال للمتابعة.</div></div></div>';
        show($('#check-result'));
        show($('#btn-goto-delegate'));
      }
    }, 1000);
  });

  $('#btn-goto-delegate')?.addEventListener('click', () => navigateTo('screen-delegate'));
  $('#btn-back-company')?.addEventListener('click', () => navigateTo('screen-company'));
  $('#btn-goto-settlement')?.addEventListener('click', () => navigateTo('screen-settlement'));
  $('#btn-back-delegate')?.addEventListener('click', () => navigateTo('screen-delegate'));
  $('#btn-submit-settlement')?.addEventListener('click', () => {
    // Navigate directly without modal if it was causing issues
    navigateTo('screen-followup');
  });

  // --- Horizontal Tabs (Increases) ---
  function bindTabs(navContainerId, contentContainerId) {
    const nav = $(navContainerId);
    if (!nav) return;
    nav.addEventListener('click', function(e) {
      if (e.target.classList.contains('h-tab')) {
        nav.querySelectorAll('.h-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        const tabId = e.target.dataset.tab;
        const contentContainer = $(contentContainerId);
        contentContainer.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(tabId);
        if (panel) panel.classList.add('active');
      }
    });
  }

  bindTabs('#increase-tabs-nav', '#increase-tabs-content');
  bindTabs('#emp-increase-tabs-nav', '#emp-increase-tabs-content');

  // --- Add Delegate ---
  let delegateCount = 1;
  $('#btn-add-delegate')?.addEventListener('click', function () {
    delegateCount++;
    const container = $('#delegates-container');
    const card = document.createElement('div');
    card.className = 'card mb-24 delegate-card';
    card.dataset.index = delegateCount;
    card.style.animation = 'fadeIn 0.4s ease forwards';
    card.innerHTML = `
      <div class="card-header">
        <h3>المفوض ${delegateCount}</h3>
        <button class="btn btn-icon btn-outline btn-sm" onclick="removeDelegate(this)" style="border-color:var(--danger);color:var(--danger); width:32px; height:32px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="card-body">
        <div class="field-grid">
          <div class="field-item"><span class="field-label">اسم المفوض</span><input type="text" class="form-control" placeholder="أدخل اسم المفوض"></div>
          <div class="field-item"><span class="field-label">الرقم القومي</span><input type="text" class="form-control" placeholder="أدخل الرقم"></div>
          <div class="field-item full-width">
            <span class="field-label">تحقيق الشخصية</span>
            <label class="attachment-field"><span class="att-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><span class="att-info"><span class="att-name">اختر ملف</span></span></label>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  window.removeDelegate = function (btn) {
    const card = btn.closest('.delegate-card');
    if (card) {
      card.remove();
    }
  };

  // Add Increase
  $('#btn-add-increase')?.addEventListener('click', function() {
    increaseCount++;
    const tabId = 'inc-' + increaseCount;
    
    // Create Nav Tab
    const newTab = document.createElement('button');
    newTab.className = 'h-tab';
    newTab.dataset.tab = tabId;
    newTab.textContent = 'زيادة ' + increaseCount;
    this.parentNode.insertBefore(newTab, this);

    // Create Panel
    const newPanel = document.createElement('div');
    newPanel.className = 'tab-content-panel';
    newPanel.id = tabId;
    newPanel.innerHTML = `
      <div class="field-grid mb-24">
        <div class="field-item">
          <span class="field-label">طريقة الزيادة</span>
          <select class="form-control">
            <option value="" disabled selected>اختر طريقة الزيادة</option>
            <option>أرباح مرحلة</option>
            <option>حصص عينية</option>
            <option>زيادة نقدية</option>
            <option>احتياطي</option>
          </select>
        </div>
        <div class="field-item">
          <span class="field-label">قيمة الزيادة</span>
          <input type="text" class="form-control" placeholder="أدخل قيمة الزيادة (بالجنيه)">
        </div>
      </div>
      <div class="section-title">المرفقات المطلوبة للزيادة</div>
      <div class="field-grid mb-24">
        <label class="attachment-field"><span class="att-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><span class="att-info"><span class="att-name">محضر الجمعية</span></span></label>
        <label class="attachment-field"><span class="att-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><span class="att-info"><span class="att-name">العقد المعدل</span></span></label>
        <label class="attachment-field"><span class="att-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><span class="att-info"><span class="att-name">خطاب الرقابة المالية بالزيادة</span></span></label>
        <label class="attachment-field"><span class="att-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><span class="att-info"><span class="att-name">طلب قيد الزيادة</span></span></label>
        <label class="attachment-field"><span class="att-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><span class="att-info"><span class="att-name">السجل التجاري</span></span></label>
        <label class="attachment-field"><span class="att-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><span class="att-info"><span class="att-name">الشهادة البنكية</span></span></label>
      </div>
      <div class="section-title">بيانات من GAFI</div>
      <div class="field-grid mb-24"><div class="field-item"><span class="field-label">قائمة المساهمين</span><div class="field-value">متاحة — المسجلة في جافي</div></div></div>
      <button class="btn btn-danger btn-sm" onclick="removeIncrease('${tabId}', this)">حذف هذه الزيادة</button>
    `;
    $('#increase-tabs-content').appendChild(newPanel);
    
    // Switch to it
    newTab.click();
  });

  window.removeIncrease = function(tabId, btn) {
    const tab = document.querySelector(`.h-tab[data-tab="${tabId}"]`);
    const panel = document.getElementById(tabId);
    if (tab) tab.remove();
    if (panel) panel.remove();
    // switch to first tab
    const firstTab = document.querySelector('#increase-tabs-nav .h-tab');
    if (firstTab) firstTab.click();
  };

  // --- Toggle Tree Node (Employee Screen) ---
  window.toggleNode = function (header) {
    const body = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');
    if (body.classList.contains('collapsed')) {
      body.classList.remove('collapsed');
      body.style.maxHeight = body.scrollHeight + 'px';
      body.style.opacity = '1';
      icon.classList.remove('collapsed');
      // allow auto height after animation
      setTimeout(() => { if (!body.classList.contains('collapsed')) body.style.maxHeight = 'none'; }, 400);
    } else {
      body.style.maxHeight = body.scrollHeight + 'px'; // force specific height before collapsing
      body.offsetHeight; // trigger reflow
      body.classList.add('collapsed');
      body.style.maxHeight = '0';
      body.style.opacity = '0';
      icon.classList.add('collapsed');
    }
  };

  // --- Modal ---
  let modalCb = null;
  window.showModal = function(title, msg, onConfirm) {
    $('#modal-title').textContent = title;
    $('#modal-message').textContent = msg;
    modalCb = onConfirm;
    $('#modal-overlay').classList.add('active');
  };
  window.closeModal = function() { $('#modal-overlay').classList.remove('active'); };
  $('#modal-confirm-btn')?.addEventListener('click', function() {
    if (modalCb) modalCb();
    closeModal();
  });
  $('#modal-overlay')?.addEventListener('click', function(e) {
    if(e.target === this) closeModal();
  });

  // Employee Actions
  $('#emp-approve-btn')?.addEventListener('click', function() {
    // Hide footer buttons
    hide($('#emp-action-footer'));
    
    // Show exporting status
    const resultDiv = $('#emp-action-result');
    resultDiv.innerHTML = `
      <div class="alert alert-info" style="border-color: var(--primary);">
        <div class="alert-content">
          <div class="alert-title" style="display: flex; align-items: center; gap: 8px; color: var(--primary);">
            <span class="spinner" style="border-color:var(--primary); border-top-color:transparent; width:16px; height:16px; border-width:2px;"></span>
            جاري الموافقة وتصدير الداتا إلى نظام مصر المقاصة...
          </div>
        </div>
      </div>
    `;
    show(resultDiv);

    // Simulate delay
    setTimeout(() => {
      // Success message
      resultDiv.innerHTML = `
        <div class="alert alert-success">
          <div class="alert-content">
            <div class="alert-title">تمت الموافقة وتصدير الداتا إلى مصر المقاصة بنجاح ✓</div>
          </div>
        </div>
      `;
      // Show checkbox
      show($('#emp-complete-divider'));
      show($('#emp-complete-wrapper'));
      // Auto check it
      const checkEl = $('#emp-complete-check');
      if (checkEl) checkEl.checked = true;
    }, 2000);
  });

})();
