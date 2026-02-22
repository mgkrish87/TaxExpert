/* ══════════════════════════════════════════════════════════════
   TaxExpert AI — Main Application (Router, Auth, Charts)
   ══════════════════════════════════════════════════════════════ */

// ─── SPA Router ───
function navigateTo(page) {
    const content = document.getElementById('appContent');
    if (!content) return;

    // Auth guard
    const protectedPages = ['dashboard', 'filing', 'documents', 'profile'];
    if (protectedPages.includes(page) && !isLoggedIn()) {
        showToast('Please sign in first', 'info');
        page = 'login';
    }

    switch (page) {
        case 'landing': content.innerHTML = renderLandingPage(); break;
        case 'login': content.innerHTML = renderLoginPage(); break;
        case 'register': content.innerHTML = renderRegisterPage(); break;
        case 'dashboard':
            content.innerHTML = renderDashboardPage();
            loadDashboardData();
            break;
        case 'filing':
            content.innerHTML = renderFilingPage();
            initWizard();
            break;
        case 'documents':
            content.innerHTML = renderDocumentsPage();
            loadDocuments();
            break;
        case 'profile':
            content.innerHTML = renderProfilePage();
            break;
        default: content.innerHTML = renderLandingPage();
    }
    updateNavbar();
    window.scrollTo(0, 0);
}

// ─── Navbar State ───
function updateNavbar() {
    const logged = isLoggedIn();
    document.querySelectorAll('[data-guest]').forEach(el => el.style.display = logged ? 'none' : '');
    document.querySelectorAll('[data-auth]').forEach(el => el.style.display = logged ? '' : 'none');
    if (logged) {
        const user = getUser();
        const greet = document.getElementById('userGreeting');
        if (greet && user) greet.textContent = `Hi, ${user.full_name.split(' ')[0]}`;
    }
}

function toggleMobileMenu() {
    const nav = document.getElementById('navLinks');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}

// ─── Auth Handlers ───
async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
        await apiLogin(
            document.getElementById('loginEmail').value,
            document.getElementById('loginPassword').value,
        );
        showToast('Welcome back!', 'success');
        navigateTo('dashboard');
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Sign In';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('regBtn');
    btn.disabled = true; btn.textContent = 'Creating account…';
    try {
        await apiRegister(
            document.getElementById('regEmail').value,
            document.getElementById('regPassword').value,
            document.getElementById('regName').value,
            document.getElementById('regPhone').value,
        );
        showToast('Account created! Welcome aboard 🎉', 'success');
        navigateTo('dashboard');
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Create Account';
    }
}

// ─── Dashboard Data ───
async function loadDashboardData() {
    try {
        const filings = await apiGetFilings();
        // Find latest calculated filing
        const latest = filings.find(f => f.tax_computation) || filings[0];

        if (latest) {
            const tc = latest.tax_computation;
            const chosen = tc ? tc[`${latest.regime}_regime`] : null;
            document.getElementById('statIncome').textContent = formatCurrency(latest.total_income || chosen?.gross_total_income);
            document.getElementById('statTax').textContent = formatCurrency(latest.tax_payable || chosen?.total_tax);
            document.getElementById('statTds').textContent = formatCurrency(latest.tds_paid);
            document.getElementById('statRefund').textContent = formatCurrency(latest.refund || Math.max(0, chosen?.refund_or_due || 0));

            // Draw charts
            if (chosen) {
                drawDeductionChart(latest.deduction_data || {});
                drawRegimeChart(tc);
            }
        }

        // Filing history table
        const historyEl = document.getElementById('filingHistory');
        if (filings.length) {
            historyEl.innerHTML = `<div class="table-container"><table class="data-table">
                <thead><tr><th>Filing ID</th><th>FY</th><th>ITR Type</th><th>Status</th><th>Tax Payable</th><th>Refund</th><th>Date</th></tr></thead>
                <tbody>${filings.map(f => `<tr>
                    <td style="color:var(--accent-primary-light)">${f.id.substring(0, 8)}…</td>
                    <td>${f.financial_year}</td><td>${f.itr_type}</td>
                    <td>${statusBadge(f.status)}</td>
                    <td>${formatCurrency(f.tax_payable)}</td>
                    <td style="color:var(--accent-secondary-light)">${formatCurrency(f.refund)}</td>
                    <td>${formatDate(f.created_at)}</td>
                </tr>`).join('')}</tbody>
            </table></div>`;
        }
    } catch (e) {
        // Backend may not be running
        console.log('Dashboard load error (backend may be offline):', e.message);
    }
}

// ─── Canvas Charts ───
function drawDeductionChart(deductions) {
    const canvas = document.getElementById('deductionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth - 48;
    const h = canvas.height = 250;

    const items = [
        { label: '80C', value: deductions.section_80c || 0, color: '#6366f1' },
        { label: '80CCD', value: deductions.section_80ccd_1b || 0, color: '#8b5cf6' },
        { label: '80D', value: deductions.section_80d || 0, color: '#10b981' },
        { label: '80G', value: deductions.section_80g || 0, color: '#3b82f6' },
        { label: 'HRA', value: deductions.hra_exemption || 0, color: '#f59e0b' },
        { label: 'Home Loan', value: deductions.home_loan_interest || 0, color: '#ef4444' },
        { label: 'Std Ded', value: deductions.standard_deduction || 75000, color: '#64748b' },
    ].filter(i => i.value > 0);

    if (!items.length) {
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('No deduction data yet', w / 2, h / 2);
        return;
    }

    const total = items.reduce((s, i) => s + i.value, 0);
    const cx = w * 0.35, cy = h / 2, r = Math.min(cx, cy) - 20;
    let startAngle = -Math.PI / 2;

    items.forEach(item => {
        const sliceAngle = (item.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        startAngle += sliceAngle;
    });

    // Inner circle (donut)
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(formatCurrency(total), cx, cy - 4);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.fillText('Total', cx, cy + 16);

    // Legend
    let ly = 20;
    items.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(w * 0.72, ly, 12, 12);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.label}: ${formatCurrency(item.value)}`, w * 0.72 + 18, ly + 10);
        ly += 24;
    });
}

function drawRegimeChart(tc) {
    const canvas = document.getElementById('regimeChart');
    if (!canvas || !tc) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth - 48;
    const h = canvas.height = 250;

    const old_tax = tc.old_regime?.total_tax || 0;
    const new_tax = tc.new_regime?.total_tax || 0;
    const maxVal = Math.max(old_tax, new_tax, 1);

    const barW = 60, gap = 40;
    const startX = (w - (barW * 2 + gap)) / 2;
    const maxBarH = h - 80;

    // Old regime bar
    const oldH = (old_tax / maxVal) * maxBarH;
    const oldGrad = ctx.createLinearGradient(0, h - 40 - oldH, 0, h - 40);
    oldGrad.addColorStop(0, '#6366f1');
    oldGrad.addColorStop(1, '#4f46e5');
    ctx.fillStyle = oldGrad;
    roundRect(ctx, startX, h - 40 - oldH, barW, oldH, 8);

    // New regime bar
    const newH = (new_tax / maxVal) * maxBarH;
    const newGrad = ctx.createLinearGradient(0, h - 40 - newH, 0, h - 40);
    newGrad.addColorStop(0, '#10b981');
    newGrad.addColorStop(1, '#059669');
    ctx.fillStyle = newGrad;
    roundRect(ctx, startX + barW + gap, h - 40 - newH, barW, newH, 8);

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Old Regime', startX + barW / 2, h - 16);
    ctx.fillText('New Regime', startX + barW + gap + barW / 2, h - 16);

    // Values on top of bars
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '600 12px Inter';
    ctx.fillText(formatCurrency(old_tax), startX + barW / 2, h - 48 - oldH);
    ctx.fillText(formatCurrency(new_tax), startX + barW + gap + barW / 2, h - 48 - newH);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
    navigateTo(isLoggedIn() ? 'dashboard' : 'landing');
});
