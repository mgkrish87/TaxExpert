/* ══════════════════════════════════════════════════════════════
   TaxExpert AI — Filing Wizard, Documents, Profile Pages
   ══════════════════════════════════════════════════════════════ */

// ─── FILING WIZARD ───
let wizardStep = 0;
let wizardFiling = null;
const WIZARD_STEPS = ['Personal Details', 'Income Sources', 'Deductions', 'Tax Calculation', 'Optimization', 'Review & Submit'];

function renderFilingPage() {
    return `
    <div class="page">
        <div class="page-container fade-in">
            <div class="page-header"><h1 class="page-title">Filing Wizard</h1><p class="page-subtitle">FY 2025-26 • ITR-1</p></div>
            <div class="wizard-progress" id="wizardProgress"></div>
            <div class="wizard-body" id="wizardBody"></div>
            <div class="wizard-footer" id="wizardFooter"></div>
        </div>
    </div>`;
}

async function initWizard() {
    wizardStep = 0;
    try {
        wizardFiling = await apiCreateFiling({ financial_year: '2025-2026', assessment_year: '2026-2027', itr_type: 'ITR-1', regime: 'new' });
    } catch (e) { showToast('Failed to create filing: ' + e.message, 'error'); return; }
    renderWizardStep();
}

function renderWizardProgress() {
    const el = document.getElementById('wizardProgress');
    if (!el) return;
    el.innerHTML = WIZARD_STEPS.map((label, i) => {
        const cls = i < wizardStep ? 'completed' : i === wizardStep ? 'active' : '';
        return `<div class="wizard-step ${cls}">
            <div style="position:relative"><div class="wizard-step-circle">${i < wizardStep ? '✓' : i + 1}</div><div class="wizard-step-label">${label}</div></div>
            ${i < WIZARD_STEPS.length - 1 ? '<div class="wizard-step-line"></div>' : ''}
        </div>`;
    }).join('');
}

function renderWizardStep() {
    renderWizardProgress();
    const body = document.getElementById('wizardBody');
    const footer = document.getElementById('wizardFooter');
    if (!body) return;
    const steps = [renderStepPersonal, renderStepIncome, renderStepDeductions, renderStepCalculation, renderStepOptimization, renderStepReview];
    body.innerHTML = steps[wizardStep]();
    footer.innerHTML = `
        ${wizardStep > 0 ? '<button class="btn btn-secondary" onclick="prevWizardStep()">← Previous</button>' : '<div></div>'}
        ${wizardStep < 5 ? '<button class="btn btn-primary" onclick="nextWizardStep()">Next →</button>' : '<button class="btn btn-success btn-lg" onclick="submitFiling()">Submit Filing ✓</button>'}`;
}

function renderStepPersonal() {
    const pi = wizardFiling?.personal_info || {};
    return `<h2 style="margin-bottom:24px">Personal Details</h2>
    <div class="form-row"><div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="piName" value="${pi.full_name || getUser()?.full_name || ''}" placeholder="As per PAN"></div>
    <div class="form-group"><label class="form-label">PAN Number</label><input class="form-input" id="piPan" value="${pi.pan || getUser()?.pan || ''}" placeholder="ABCDE1234F" maxlength="10" style="text-transform:uppercase"></div></div>
    <div class="form-row"><div class="form-group"><label class="form-label">Date of Birth</label><input type="date" class="form-input" id="piDob" value="${pi.date_of_birth || getUser()?.date_of_birth || ''}"></div>
    <div class="form-group"><label class="form-label">Gender</label><select class="form-select" id="piGender"><option value="male" ${pi.gender === 'male' ? 'selected' : ''}>Male</option><option value="female" ${pi.gender === 'female' ? 'selected' : ''}>Female</option><option value="other" ${pi.gender === 'other' ? 'selected' : ''}>Other</option></select></div></div>
    <div class="form-row"><div class="form-group"><label class="form-label">Residential Status</label><select class="form-select" id="piResidential"><option value="resident" ${pi.residential_status === 'resident' ? 'selected' : ''}>Resident</option><option value="nri">Non-Resident</option><option value="rnor">RNOR</option></select></div>
    <div class="form-group"><label class="form-label">Employer Name</label><input class="form-input" id="piEmployer" value="${pi.employer_name || ''}" placeholder="Company name"></div></div>`;
}

function renderStepIncome() {
    const inc = wizardFiling?.income_data || {};
    const fields = [['Salary Income', 'salary', inc.salary || ''], ['Income from House Property', 'house_property', inc.house_property || ''], ['Short-Term Capital Gains', 'capital_gains_short', inc.capital_gains_short || ''], ['Long-Term Capital Gains', 'capital_gains_long', inc.capital_gains_long || ''], ['Business/Profession Income', 'business_income', inc.business_income || ''], ['Other Income (Interest, etc.)', 'other_income', inc.other_income || '']];
    return `<h2 style="margin-bottom:24px">Income Sources</h2>
    <div class="form-row">${fields.map(([label, id, val]) => `<div class="form-group"><label class="form-label">${label}</label><input type="number" class="form-input" id="inc_${id}" value="${val}" placeholder="0" min="0"></div>`).join('')}</div>`;
}

function renderStepDeductions() {
    const ded = wizardFiling?.deduction_data || {};
    return `<h2 style="margin-bottom:8px">Deductions</h2><p class="page-subtitle" style="margin-bottom:24px">Applicable under Old Regime. New regime allows only standard deduction.</p>
    <div class="form-row">
    <div class="form-group"><label class="form-label">Section 80C (ELSS, PPF, LIC) <span style="color:var(--text-muted)">Max ₹1,50,000</span></label><input type="number" class="form-input" id="ded_80c" value="${ded.section_80c || ''}" placeholder="0" max="150000"></div>
    <div class="form-group"><label class="form-label">Section 80CCD(1B) — NPS <span style="color:var(--text-muted)">Max ₹50,000</span></label><input type="number" class="form-input" id="ded_80ccd" value="${ded.section_80ccd_1b || ''}" placeholder="0" max="50000"></div>
    <div class="form-group"><label class="form-label">Section 80D — Health Insurance</label><input type="number" class="form-input" id="ded_80d" value="${ded.section_80d || ''}" placeholder="0"></div>
    <div class="form-group"><label class="form-label">Section 80G — Donations</label><input type="number" class="form-input" id="ded_80g" value="${ded.section_80g || ''}" placeholder="0"></div>
    <div class="form-group"><label class="form-label">HRA Exemption</label><input type="number" class="form-input" id="ded_hra" value="${ded.hra_exemption || ''}" placeholder="0"></div>
    <div class="form-group"><label class="form-label">Home Loan Interest (Sec 24) <span style="color:var(--text-muted)">Max ₹2,00,000</span></label><input type="number" class="form-input" id="ded_homeloan" value="${ded.home_loan_interest || ''}" placeholder="0" max="200000"></div>
    <div class="form-group"><label class="form-label">Education Loan Interest (80E)</label><input type="number" class="form-input" id="ded_edu" value="${ded.education_loan_interest || ''}" placeholder="0"></div>
    <div class="form-group"><label class="form-label">TDS Already Paid</label><input type="number" class="form-input" id="ded_tds" value="${wizardFiling?.tds_paid || ''}" placeholder="0"></div>
    </div>`;
}

function renderStepCalculation() {
    return `<h2 style="margin-bottom:24px">Tax Calculation</h2>
    <p class="page-subtitle" style="margin-bottom:24px">Comparing Old vs New tax regime for FY 2025-26</p>
    <div id="taxComparisonArea"><div style="text-align:center;padding:40px"><div class="spinner" style="margin:0 auto 16px"></div><p style="color:var(--text-secondary)">Calculating your tax…</p></div></div>`;
}

function renderStepOptimization() {
    return `<h2 style="margin-bottom:24px">Tax Optimization Suggestions</h2>
    <p class="page-subtitle" style="margin-bottom:24px">AI-powered recommendations to reduce your tax liability</p>
    <div id="suggestionsArea"><div style="text-align:center;padding:40px"><div class="spinner" style="margin:0 auto 16px"></div><p style="color:var(--text-secondary)">Analyzing your profile…</p></div></div>`;
}

function renderStepReview() {
    const pi = wizardFiling?.personal_info || {};
    const inc = wizardFiling?.income_data || {};
    const ded = wizardFiling?.deduction_data || {};
    const tc = wizardFiling?.tax_computation;
    const chosen = tc ? tc[`${wizardFiling.regime}_regime`] : null;
    return `<h2 style="margin-bottom:24px">Review & Submit</h2>
    <div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:12px">👤 Personal Info</h3>
    <div class="tax-row"><span class="label">Name</span><span class="value">${pi.full_name || '—'}</span></div>
    <div class="tax-row"><span class="label">PAN</span><span class="value">${pi.pan || '—'}</span></div>
    <div class="tax-row"><span class="label">Employer</span><span class="value">${pi.employer_name || '—'}</span></div></div>
    <div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:12px">💼 Income Summary</h3>
    <div class="tax-row"><span class="label">Salary</span><span class="value">${formatCurrency(inc.salary)}</span></div>
    <div class="tax-row"><span class="label">Other Income</span><span class="value">${formatCurrency((inc.house_property || 0) + (inc.capital_gains_short || 0) + (inc.capital_gains_long || 0) + (inc.business_income || 0) + (inc.other_income || 0))}</span></div>
    <div class="tax-row total"><span class="label">Gross Total Income</span><span class="value">${formatCurrency(chosen?.gross_total_income)}</span></div></div>
    <div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:12px">🧮 Tax Summary (${wizardFiling?.regime === 'old' ? 'Old' : 'New'} Regime)</h3>
    <div class="tax-row"><span class="label">Taxable Income</span><span class="value">${formatCurrency(chosen?.taxable_income)}</span></div>
    <div class="tax-row"><span class="label">Tax + Surcharge + Cess</span><span class="value">${formatCurrency(chosen?.total_tax)}</span></div>
    <div class="tax-row"><span class="label">TDS Paid</span><span class="value">${formatCurrency(chosen?.tds_paid)}</span></div>
    <div class="tax-row total"><span class="label">${(chosen?.refund_or_due || 0) >= 0 ? '🎉 Refund' : '💳 Tax Due'}</span><span class="value" style="color:${(chosen?.refund_or_due || 0) >= 0 ? 'var(--accent-secondary-light)' : 'var(--accent-danger)'}">${formatCurrency(Math.abs(chosen?.refund_or_due || 0))}</span></div></div>`;
}

function collectPersonalInfo() {
    return { full_name: document.getElementById('piName')?.value || '', pan: (document.getElementById('piPan')?.value || '').toUpperCase(), date_of_birth: document.getElementById('piDob')?.value || '', gender: document.getElementById('piGender')?.value || 'male', residential_status: document.getElementById('piResidential')?.value || 'resident', employer_name: document.getElementById('piEmployer')?.value || '' };
}
function collectIncomeData() {
    const v = id => parseFloat(document.getElementById(id)?.value) || 0;
    return { salary: v('inc_salary'), house_property: v('inc_house_property'), capital_gains_short: v('inc_capital_gains_short'), capital_gains_long: v('inc_capital_gains_long'), business_income: v('inc_business_income'), other_income: v('inc_other_income') };
}
function collectDeductionData() {
    const v = id => parseFloat(document.getElementById(id)?.value) || 0;
    return { section_80c: v('ded_80c'), section_80ccd_1b: v('ded_80ccd'), section_80d: v('ded_80d'), section_80g: v('ded_80g'), hra_exemption: v('ded_hra'), home_loan_interest: v('ded_homeloan'), education_loan_interest: v('ded_edu'), standard_deduction: 75000 };
}

async function nextWizardStep() {
    try {
        if (wizardStep === 0) {
            await apiUpdateFiling(wizardFiling.id, { personal_info: collectPersonalInfo(), status: 'in_progress' });
            wizardFiling.personal_info = collectPersonalInfo();
        } else if (wizardStep === 1) {
            const inc = collectIncomeData();
            await apiUpdateFiling(wizardFiling.id, { income_data: inc });
            wizardFiling.income_data = inc;
        } else if (wizardStep === 2) {
            const ded = collectDeductionData();
            const tds = parseFloat(document.getElementById('ded_tds')?.value) || 0;
            await apiUpdateFiling(wizardFiling.id, { deduction_data: ded, tds_paid: tds });
            wizardFiling.deduction_data = ded;
            wizardFiling.tds_paid = tds;
        }
        wizardStep++;
        renderWizardStep();
        if (wizardStep === 3) loadTaxCalculation();
        if (wizardStep === 4) loadSuggestions();
    } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

function prevWizardStep() { if (wizardStep > 0) { wizardStep--; renderWizardStep(); } }

async function loadTaxCalculation() {
    try {
        const result = await apiCalculateTax(wizardFiling.id);
        wizardFiling.tax_computation = result;
        const area = document.getElementById('taxComparisonArea');
        if (!area) return;
        area.innerHTML = `
        <div class="tax-comparison">
            ${['old', 'new'].map(regime => {
            const r = result[`${regime}_regime`];
            const isRec = result.recommended === regime;
            return `<div class="regime-card ${isRec ? 'recommended' : ''}">
                    ${isRec ? '<div class="recommended-badge">✨ Recommended</div>' : ''}
                    <h3>${regime === 'old' ? 'Old' : 'New'} Regime</h3>
                    <div class="tax-row"><span class="label">Gross Income</span><span class="value">${formatCurrency(r.gross_total_income)}</span></div>
                    <div class="tax-row"><span class="label">Deductions</span><span class="value">- ${formatCurrency(r.total_deductions)}</span></div>
                    <div class="tax-row"><span class="label">Taxable Income</span><span class="value">${formatCurrency(r.taxable_income)}</span></div>
                    <div class="tax-row"><span class="label">Tax</span><span class="value">${formatCurrency(r.tax_on_income)}</span></div>
                    <div class="tax-row"><span class="label">Surcharge</span><span class="value">${formatCurrency(r.surcharge)}</span></div>
                    <div class="tax-row"><span class="label">Cess (4%)</span><span class="value">${formatCurrency(r.cess)}</span></div>
                    <div class="tax-row total"><span class="label">Total Tax</span><span class="value">${formatCurrency(r.total_tax)}</span></div>
                </div>`;
        }).join('')}
        </div>
        <div style="text-align:center;margin-top:24px;padding:16px;background:rgba(16,185,129,0.08);border-radius:var(--radius-md);border:1px solid rgba(16,185,129,0.2)">
            <p style="font-size:1.1rem;font-weight:700;color:var(--accent-secondary-light)">💰 You save ${formatCurrency(result.savings)} with the ${result.recommended === 'old' ? 'Old' : 'New'} Regime</p>
        </div>`;
        wizardFiling.regime = result.recommended;
        await apiUpdateFiling(wizardFiling.id, { regime: result.recommended });
    } catch (e) {
        document.getElementById('taxComparisonArea').innerHTML = `<div class="empty-state"><p style="color:var(--accent-danger)">Error: ${e.message}</p></div>`;
    }
}

async function loadSuggestions() {
    try {
        const suggestions = await apiGetSuggestions(wizardFiling.id);
        const area = document.getElementById('suggestionsArea');
        if (!area) return;
        area.innerHTML = suggestions.map(s => {
            const icons = { 'Section 80C': '🏦', 'Section 80CCD(1B)': '💼', 'Section 80D': '🏥', 'Home Loan Interest': '🏠', 'Regime Comparison': '⚖️', 'Optimized': '✅' };
            return `<div class="suggestion-card">
                <div class="suggestion-icon">${icons[s.category] || '💡'}</div>
                <div class="suggestion-content">
                    <h4>${s.title}</h4>
                    <p>${s.description}</p>
                    ${s.potential_saving > 0 ? `<div class="suggestion-saving">Potential saving: ${formatCurrency(s.potential_saving)}</div>` : ''}
                </div>
                <span class="badge badge-${s.priority === 'high' ? 'danger' : s.priority === 'medium' ? 'warning' : 'info'}">${s.priority}</span>
            </div>`;
        }).join('');
    } catch (e) {
        document.getElementById('suggestionsArea').innerHTML = `<p style="color:var(--accent-danger)">Error loading suggestions.</p>`;
    }
}

async function submitFiling() {
    try {
        await apiUpdateFiling(wizardFiling.id, { status: 'submitted' });
        showToast('Filing submitted successfully! 🎉', 'success');
        navigateTo('dashboard');
    } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ─── DOCUMENTS PAGE ───
function renderDocumentsPage() {
    return `
    <div class="page">
        <div class="page-container fade-in">
            <div class="page-header"><h1 class="page-title">Documents</h1><p class="page-subtitle">Upload and manage your tax documents</p></div>
            <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="handleDrop(event)">
                <input type="file" id="fileInput" style="display:none" onchange="handleFileUpload(event)" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                <div class="upload-icon">📁</div>
                <h3>Drop files here or click to upload</h3>
                <p>PDF, JPG, PNG, DOC up to 10MB • Form 16, Bank Statements, Investment Proofs</p>
            </div>
            <div class="form-group" style="margin-top:16px;max-width:250px">
                <label class="form-label">Document Type</label>
                <select class="form-select" id="docTypeSelect">
                    <option value="form16">Form 16</option><option value="bank_statement">Bank Statement</option><option value="investment_proof">Investment Proof</option><option value="rent_receipt">Rent Receipt</option><option value="salary_slip">Salary Slip</option><option value="other">Other</option>
                </select>
            </div>
            <div class="doc-grid" id="docGrid"></div>
        </div>
    </div>`;
}

async function loadDocuments() {
    try {
        const docs = await apiGetDocuments();
        const grid = document.getElementById('docGrid');
        if (!grid) return;
        if (!docs.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📄</div><h3>No documents yet</h3><p>Upload your first document above.</p></div>'; return; }
        grid.innerHTML = docs.map(d => {
            const icons = { form16: '📋', bank_statement: '🏦', investment_proof: '📈', rent_receipt: '🏠', salary_slip: '💼', other: '📄' };
            return `<div class="doc-card"><div class="doc-icon">${icons[d.doc_type] || '📄'}</div><div class="doc-info"><div class="doc-name">${d.filename}</div><div class="doc-meta">${d.doc_type.replace('_', ' ')} • ${d.file_size ? (d.file_size / 1024).toFixed(1) + 'KB' : ''} • ${formatDate(d.uploaded_at)}</div></div><div class="doc-actions"><button class="btn btn-ghost btn-sm" onclick="deleteDoc('${d.id}')" title="Delete">🗑️</button></div></div>`;
        }).join('');
    } catch (e) { showToast('Failed to load documents', 'error'); }
}

async function handleFileUpload(event) {
    const files = event.target.files;
    const docType = document.getElementById('docTypeSelect')?.value || 'other';
    for (const file of files) {
        try { await apiUploadDocument(file, docType); showToast(`${file.name} uploaded!`, 'success'); } catch (e) { showToast(`Failed: ${file.name}`, 'error'); }
    }
    loadDocuments();
    event.target.value = '';
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length) { document.getElementById('fileInput').files = files; handleFileUpload({ target: { files, value: '' } }); }
}

async function deleteDoc(id) {
    try { await apiDeleteDocument(id); showToast('Document deleted', 'info'); loadDocuments(); } catch (e) { showToast('Failed to delete', 'error'); }
}

// ─── PROFILE PAGE ───
function renderProfilePage() {
    const user = getUser() || {};
    return `
    <div class="page">
        <div class="page-container fade-in">
            <div class="profile-header">
                <div class="profile-avatar">${(user.full_name || 'U')[0].toUpperCase()}</div>
                <div class="profile-info"><h2>${user.full_name || 'User'}</h2><p>${user.email || ''}</p></div>
            </div>
            <div class="profile-grid">
                <div class="card">
                    <h3 style="margin-bottom:20px">Personal Information</h3>
                    <form onsubmit="handleProfileUpdate(event)">
                        <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="profName" value="${user.full_name || ''}"></div>
                        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="profPhone" value="${user.phone || ''}" placeholder="+91 98765 43210"></div>
                        <div class="form-group"><label class="form-label">Date of Birth</label><input type="date" class="form-input" id="profDob" value="${user.date_of_birth || ''}"></div>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </form>
                </div>
                <div class="card">
                    <h3 style="margin-bottom:20px">Tax Identity</h3>
                    <form onsubmit="handleTaxIdUpdate(event)">
                        <div class="form-group"><label class="form-label">PAN Number</label><input class="form-input" id="profPan" value="${user.pan || ''}" placeholder="ABCDE1234F" maxlength="10" style="text-transform:uppercase"></div>
                        <div class="form-group"><label class="form-label">Aadhaar Number</label><input class="form-input" id="profAadhaar" value="${user.aadhaar || ''}" placeholder="1234 5678 9012" maxlength="12"></div>
                        <button type="submit" class="btn btn-primary">Link Identity</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    try {
        const data = { full_name: document.getElementById('profName').value, phone: document.getElementById('profPhone').value, date_of_birth: document.getElementById('profDob').value };
        const user = await apiUpdateProfile(data);
        setUser(user);
        updateNavbar();
        showToast('Profile updated!', 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
}

async function handleTaxIdUpdate(e) {
    e.preventDefault();
    try {
        const data = { pan: document.getElementById('profPan').value.toUpperCase(), aadhaar: document.getElementById('profAadhaar').value };
        const user = await apiUpdateProfile(data);
        setUser(user);
        showToast('Tax identity linked!', 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
}
