/* ══════════════════════════════════════════════════════════════
   TaxExpert AI — Page Templates (Landing, Auth, Dashboard)
   ══════════════════════════════════════════════════════════════ */

function renderLandingPage() {
    return `
    <section class="hero" id="hero">
        <div class="hero-container">
            <div class="hero-content slide-up">
                <div class="hero-badge">⚡ AI-Powered Tax Filing</div>
                <h1>File Your Taxes<br><span class="gradient-text">Smarter, Faster</span></h1>
                <p class="hero-description">India's most intelligent tax filing platform. AI-driven deduction discovery, real-time regime comparison, and zero-error compliance — all in minutes.</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary btn-lg" onclick="navigateTo('register')">Start Filing Free →</button>
                    <button class="btn btn-secondary btn-lg" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})">See Features</button>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat"><div class="hero-stat-value">₹2.4Cr+</div><div class="hero-stat-label">Tax Saved</div></div>
                    <div class="hero-stat"><div class="hero-stat-value">50K+</div><div class="hero-stat-label">Returns Filed</div></div>
                    <div class="hero-stat"><div class="hero-stat-value">99.9%</div><div class="hero-stat-label">Accuracy</div></div>
                </div>
            </div>
            <div class="hero-visual fade-in">
                <div class="hero-card-stack">
                    <div class="hero-mock-card">
                        <div class="mock-card-header"><span class="mock-card-title">Tax Computation FY 2025-26</span><span class="badge badge-success">Optimized</span></div>
                        <div class="mock-bar"><div class="mock-bar-fill" style="width:72%"></div></div>
                        <div class="mock-label">Section 80C Utilization</div>
                        <div class="mock-bar"><div class="mock-bar-fill green" style="width:45%"></div></div>
                        <div class="mock-label">80D Health Insurance</div>
                        <div class="mock-amount">₹47,580</div>
                        <div class="mock-label">Estimated Refund</div>
                    </div>
                    <div class="hero-mock-card"></div>
                </div>
            </div>
        </div>
    </section>
    <section class="features-section" id="features">
        <div class="section-header">
            <div class="section-badge">✨ Features</div>
            <h2 class="section-title">Everything You Need to File Like a Pro</h2>
            <p class="section-subtitle">From document parsing to compliance checks — TaxExpert AI handles it all.</p>
        </div>
        <div class="features-grid">
            ${[
            ['🤖', 'AI Tax Optimization', 'Smart suggestions to minimize tax liability with regime comparison and deduction discovery.'],
            ['📄', 'Document Intelligence', 'Upload Form 16 and bank statements — AI extracts and auto-fills your data.'],
            ['⚡', 'Guided Filing Wizard', 'Step-by-step wizard walks you through every section of your ITR. No expertise needed.'],
            ['📊', 'Real-Time Dashboard', 'Visual analytics showing tax summary, deduction utilization, and refund predictions.'],
            ['🔒', 'Bank-Grade Security', 'AES-256 encryption, JWT auth, and role-based access keep your data safe.'],
            ['📋', 'Compliance Engine', 'Automatic validation catches errors before submission. Audit-safe filing guaranteed.']
        ].map(([icon, title, desc]) => `
                <div class="feature-card">
                    <div class="feature-icon">${icon}</div>
                    <h3>${title}</h3>
                    <p>${desc}</p>
                </div>
            `).join('')}
        </div>
    </section>
    <section class="hiw-section" id="how-it-works">
        <div class="hiw-container">
            <div class="section-header">
                <div class="section-badge">🚀 How It Works</div>
                <h2 class="section-title">File in 4 Simple Steps</h2>
            </div>
            <div class="hiw-steps">
                ${[['1', 'Sign Up', 'Create your account and link PAN in seconds.'], ['2', 'Upload Docs', 'Upload Form 16, bank statements, or investment proofs.'], ['3', 'Review & Optimize', 'AI auto-fills data and suggests tax-saving strategies.'], ['4', 'File ITR', 'One-click filing with compliance validation.']].map(([n, t, d]) => `
                    <div class="hiw-step"><div class="hiw-step-number">${n}</div><h3>${t}</h3><p>${d}</p></div>
                `).join('')}
            </div>
        </div>
    </section>
    <section class="cta-section">
        <div class="cta-content">
            <h2>Ready to File <span class="gradient-text">Smarter</span>?</h2>
            <p>Join thousands of Indians who trust TaxExpert AI for hassle-free tax filing.</p>
            <button class="btn btn-primary btn-lg" onclick="navigateTo('register')">Get Started Free →</button>
        </div>
    </section>
    <footer class="footer">
        <p>© 2026 TaxExpert AI. Built with ❤️ for Indian Taxpayers. All rights reserved.</p>
    </footer>`;
}

function renderLoginPage() {
    return `
    <div class="auth-page page">
        <div class="auth-card fade-in">
            <div class="auth-header">
                <h2>Welcome Back</h2>
                <p>Sign in to your TaxExpert AI account</p>
            </div>
            <form onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-input" id="loginEmail" placeholder="you@example.com" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" id="loginPassword" placeholder="Enter your password" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="loginBtn">Sign In</button>
            </form>
            <div class="auth-footer">
                Don't have an account? <a onclick="navigateTo('register')">Create one</a>
            </div>
        </div>
    </div>`;
}

function renderRegisterPage() {
    return `
    <div class="auth-page page">
        <div class="auth-card fade-in">
            <div class="auth-header">
                <h2>Create Account</h2>
                <p>Start your tax filing journey with AI</p>
            </div>
            <form onsubmit="handleRegister(event)">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-input" id="regName" placeholder="Enter your full name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-input" id="regEmail" placeholder="you@example.com" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" class="form-input" id="regPhone" placeholder="+91 98765 43210">
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" id="regPassword" placeholder="Min 8 characters" required minlength="8">
                </div>
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="regBtn">Create Account</button>
            </form>
            <div class="auth-footer">
                Already have an account? <a onclick="navigateTo('login')">Sign in</a>
            </div>
        </div>
    </div>`;
}

function renderDashboardPage() {
    return `
    <div class="page">
        <div class="page-container fade-in">
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center">
                <div>
                    <h1 class="page-title">Dashboard</h1>
                    <p class="page-subtitle">Welcome back! Here's your tax overview for FY 2025-26.</p>
                </div>
                <button class="btn btn-primary" onclick="navigateTo('filing')">+ New Filing</button>
            </div>
            <div class="dashboard-stats" id="dashboardStats">
                <div class="stat-card"><div class="stat-label">Total Income</div><div class="stat-value" id="statIncome">—</div></div>
                <div class="stat-card green"><div class="stat-label">Tax Payable</div><div class="stat-value" id="statTax">—</div></div>
                <div class="stat-card amber"><div class="stat-label">TDS Paid</div><div class="stat-value" id="statTds">—</div></div>
                <div class="stat-card green"><div class="stat-label">Expected Refund</div><div class="stat-value" id="statRefund">—</div></div>
            </div>
            <div class="dashboard-charts">
                <div class="chart-card">
                    <h3>Deduction Breakdown</h3>
                    <canvas id="deductionChart" height="250"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Regime Comparison</h3>
                    <canvas id="regimeChart" height="250"></canvas>
                </div>
            </div>
            <div class="card">
                <h3 style="margin-bottom:16px">Filing History</h3>
                <div id="filingHistory">
                    <div class="empty-state"><div class="empty-state-icon">📋</div><h3>No filings yet</h3><p>Start your first tax filing to see it here.</p><button class="btn btn-primary" onclick="navigateTo('filing')">Start Filing</button></div>
                </div>
            </div>
        </div>
    </div>`;
}
