 (function() {
            'use strict';

            // ============================================================
            // 1.  API CONFIGURATION — PASTE YOUR KEY & URL HERE
            // ============================================================
            // ============================================================
            //  IMPORTANT: Replace the values below with your own Numverify
            //  API key and endpoint URL.
            // ============================================================

            const API_KEY = "9e8f0acf04ba9175d4941c29fae5cea6";
            const API_URL = "https://apilayer.net/api/validate";

            // Example (do not use these):
            // const API_KEY = "your_actual_api_key";
            // const API_URL = "http://apilayer.net/api/validate";

            // ============================================================
            // 2.  DOM REFS
            // ============================================================
            const form = document.getElementById('lookupForm');
            const phoneInput = document.getElementById('phoneInput');
            const countrySelect = document.getElementById('countryCode');
            const lookupBtn = document.getElementById('lookupBtn');
            const btnText = document.getElementById('btnText');
            const btnSpinner = document.getElementById('btnSpinner');
            const resultArea = document.getElementById('resultArea');

            const menuToggle = document.getElementById('menuToggle');
            const mobileMenu = document.getElementById('mobileMenu');
            const menuIcon = document.getElementById('menuIcon');

            const faqBtns = document.querySelectorAll('.faq-btn');

            // ============================================================
            // 3.  MOBILE MENU
            // ============================================================
            let menuOpen = false;

            menuToggle.addEventListener('click', function() {
                menuOpen = !menuOpen;
                mobileMenu.classList.toggle('mobile-nav-open');
                menuIcon.className = menuOpen ? 'fas fa-times text-xl' : 'fas fa-bars text-xl';
                // also toggle the mobile-nav-open on the parent? we use .mobile-menu
                // we'll just toggle a class on the header or a wrapper
                const header = document.getElementById('navbar');
                if (menuOpen) {
                    header.classList.add('mobile-nav-open');
                } else {
                    header.classList.remove('mobile-nav-open');
                }
            });

            // Close menu on link click
            document.querySelectorAll('.mobile-menu a').forEach(link => {
                link.addEventListener('click', function() {
                    menuOpen = false;
                    mobileMenu.classList.remove('mobile-nav-open');
                    document.getElementById('navbar').classList.remove('mobile-nav-open');
                    menuIcon.className = 'fas fa-bars text-xl';
                });
            });

            // ============================================================
            // 4.  FAQ ACCORDION
            // ============================================================
            faqBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const item = this.closest('.faq-item');
                    const isActive = item.classList.contains('active');

                    // Close all siblings (optional — we close only this one)
                    // If you want only one open at a time, uncomment:
                    // document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));

                    if (isActive) {
                        item.classList.remove('active');
                    } else {
                        // Close others if you want single-open:
                        // document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
                        item.classList.add('active');
                    }
                });
            });

            // ============================================================
            // 5.  LOOKUP FORM HANDLING
            // ============================================================
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                // Get values
                const phone = phoneInput.value.trim();
                const country = countrySelect.value;

                // Validate
                if (!phone) {
                    showResult('error', 'Please enter a phone number.');
                    return;
                }

                // Build the number to send: if country selected, prepend? Actually Numverify
                // accepts `number` and optional `country_code`. We'll send both.
                // We'll also strip any spaces/dashes for cleanliness.
                const cleanPhone = phone.replace(/[\s\-()]/g, '');

                // Show loading
                setLoading(true);
                resultArea.innerHTML = '';

                try {
                    // Build URL with query params
                    // Numverify expects: ?access_key=KEY&number=NUMBER&country_code=CODE
                    const params = new URLSearchParams();
                    params.append('access_key', API_KEY);
                    params.append('number', cleanPhone);
                    if (country) {
                        params.append('country_code', country);
                    }

                    const url = `${API_URL}?${params.toString()}`;

                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`API responded with status ${response.status}`);
                    }

                    const data = await response.json();

                    // Check for API error
                    if (data.success === false || data.error) {
                        const errMsg = data.error?.info || data.error?.type || 'API returned an error.';
                        throw new Error(errMsg);
                    }

                    // Render results
                    renderResult(data);

                } catch (err) {
                    console.error('Lookup error:', err);
                    showResult('error', err.message || 'Something went wrong. Please try again.');
                } finally {
                    setLoading(false);
                }
            });

            // ============================================================
            // 6.  UI HELPERS
            // ============================================================
            function setLoading(loading) {
                if (loading) {
                    lookupBtn.disabled = true;
                    btnText.textContent = 'Checking...';
                    btnSpinner.classList.remove('hidden');
                    lookupBtn.classList.add('opacity-80', 'cursor-not-allowed');
                } else {
                    lookupBtn.disabled = false;
                    btnText.textContent = 'Check Number';
                    btnSpinner.classList.add('hidden');
                    lookupBtn.classList.remove('opacity-80', 'cursor-not-allowed');
                }
            }

            function showResult(type, message) {
                const isError = type === 'error';
                const bg = isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700';
                const icon = isError ? 'fa-exclamation-circle' : 'fa-check-circle';
                resultArea.innerHTML = `
                    <div class="result-enter p-4 rounded-xl border ${bg} flex items-start gap-3 text-sm">
                        <i class="fas ${icon} mt-0.5 text-base"></i>
                        <span>${message}</span>
                    </div>
                `;
            }

            // ============================================================
            // 7.  RENDER RESULT
            // ============================================================
            function renderResult(data) {
                // Data fields from Numverify:
                // valid, number, local_format, international_format, country_prefix,
                // country_code, country_name, location, carrier, line_type
                const valid = data.valid === true || data.valid === 'true';

                let html = `
                    <div class="result-enter mt-2 bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 sm:p-6">
                        <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200/60">
                            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${valid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">
                                <i class="fas ${valid ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                ${valid ? 'Valid Number' : 'Invalid Number'}
                            </span>
                            ${data.country_name ? `<span class="text-xs text-slate-400">${data.country_name}</span>` : ''}
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                `;

                // Helper to add a row
                const addRow = (label, value, icon) => {
                    if (value && value !== '' && value !== null && value !== undefined) {
                        html += `
                            <div class="flex items-start gap-2.5 bg-white rounded-lg px-3.5 py-2.5 border border-slate-100 shadow-sm">
                                <i class="fas ${icon} text-indigo-400 text-xs mt-0.5 w-4 text-center"></i>
                                <div>
                                    <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">${label}</div>
                                    <div class="text-slate-800 font-medium text-sm">${value}</div>
                                </div>
                            </div>
                        `;
                    }
                };

                addRow('Country', data.country_name, 'fa-globe');
                addRow('Country Code', data.country_code, 'fa-code');
                addRow('Location', data.location, 'fa-location-dot');
                addRow('Carrier', data.carrier, 'fa-building');
                addRow('Line Type', data.line_type, 'fa-tag');
                addRow('International', data.international_format, 'fa-phone');
                addRow('Local Format', data.local_format, 'fa-phone-alt');

                html += `
                        </div>
                    </div>
                `;

                resultArea.innerHTML = html;
            }

            // ============================================================
            // 8.  SMOOTH SCROLL (for anchor links)
            // ============================================================
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                });
            });

            // ============================================================
            // 9.  KEYBOARD SHORTCUT: Enter to submit (already handled by form)
            // ============================================================

            // ============================================================
            // 10. INITIAL STATE — check if API key is set
            // ============================================================
            if (API_KEY === 'PASTE_YOUR_API_KEY_HERE' || API_URL === 'PASTE_YOUR_API_URL_HERE') {
                console.warn(
                    '⚠️ NumCheck: Please set your API_KEY and API_URL in the JavaScript configuration section.');
                // Show a subtle notice in the tool area
                const toolCard = document.querySelector('#lookup .bg-white');
                if (toolCard) {
                    const notice = document.createElement('div');
                    notice.className =
                        'mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-start gap-2.5';
                    notice.innerHTML = `
                        <i class="fas fa-triangle-exclamation mt-0.5"></i>
                        <span><strong>API not configured.</strong> Please paste your Numverify API key and URL in the <code class="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">script.js</code> configuration section.</span>
                    `;
                    toolCard.appendChild(notice);
                }
            }

        })();