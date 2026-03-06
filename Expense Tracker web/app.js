(function () {
    let transactions = [];

    const STORAGE_KEY = 'flow_expense_tracker';

    function loadTransactions() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                transactions = JSON.parse(stored);
            } catch (e) {
                transactions = [];
            }
        } else {
            transactions = [];
        }
    }

    function saveTransactions() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }

    const incomeEl = document.getElementById('totalIncome');
    const expenseEl = document.getElementById('totalExpense');
    const balanceEl = document.getElementById('balanceValue');
    const txList = document.getElementById('transactionList');
    const addBtn = document.getElementById('addBtn');
    const amountInp = document.getElementById('amountInput');
    const descInp = document.getElementById('descInput');
    const typeSelect = document.getElementById('typeSelect');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const txCountSpan = document.getElementById('txCount');

    let currentFilter = 'all';

    const formatMoney = (val) => val.toFixed(2);

    function updateSummary() {
        let totalIncome = 0, totalExpense = 0;
        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpense += t.amount;
        });
        const balance = totalIncome - totalExpense;

        incomeEl.textContent = formatMoney(totalIncome);
        expenseEl.textContent = formatMoney(totalExpense);
        balanceEl.textContent = formatMoney(balance);

        if (balance >= 0) {
            balanceEl.classList.remove('negative');
            balanceEl.classList.add('positive');
        } else {
            balanceEl.classList.remove('positive');
            balanceEl.classList.add('negative');
        }

    }

    function renderList() {
        let filtered = transactions;
        if (currentFilter === 'income') {
            filtered = transactions.filter(t => t.type === 'income');
        } else if (currentFilter === 'expense') {
            filtered = transactions.filter(t => t.type === 'expense');
        }

        txList.innerHTML = '';

        if (filtered.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.className = 'empty-list';
            emptyMsg.textContent = currentFilter === 'all' ? 'no transactions yet — add one above'
                : (currentFilter === 'income' ? 'no income entries' : 'no expense entries');
            txList.appendChild(emptyMsg);
        } else {
            filtered.forEach(tx => {
                const li = document.createElement('li');
                li.className = 'transaction-item';
                li.dataset.id = tx.id;

                const leftDiv = document.createElement('div');
                leftDiv.className = 'tx-left';

                const badge = document.createElement('span');
                badge.className = 'tx-type-badge';
                badge.textContent = tx.type === 'income' ? 'INCOME' : 'EXPENSE';
                if (tx.type === 'income') badge.style.background = '#e3f3e9';
                else badge.style.background = '#fee9e7';

                const descSpan = document.createElement('span');
                descSpan.className = 'tx-desc';
                descSpan.textContent = tx.description || '—';

                leftDiv.appendChild(badge);
                leftDiv.appendChild(descSpan);

                const rightDiv = document.createElement('div');
                rightDiv.style.display = 'flex';
                rightDiv.style.alignItems = 'center';
                rightDiv.style.gap = '0.3rem';

                const amountSpan = document.createElement('span');
                amountSpan.className = `tx-amount ${tx.type === 'income' ? 'income-amount' : 'expense-amount'}`;
                amountSpan.textContent = `$${formatMoney(tx.amount)}`;

                const delBtn = document.createElement('button');
                delBtn.className = 'delete-btn';
                delBtn.innerHTML = '✕';
                delBtn.setAttribute('aria-label', 'delete');
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteTransaction(tx.id);
                });

                rightDiv.appendChild(amountSpan);
                rightDiv.appendChild(delBtn);

                li.appendChild(leftDiv);
                li.appendChild(rightDiv);
                txList.appendChild(li);
            });
        }

        txCountSpan.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;
    }

    function deleteTransaction(id) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateSummary();
        renderList();
    }

    function addTransaction() {
        const amountRaw = amountInp.value.trim();
        const desc = descInp.value.trim();
        const type = typeSelect.value;

        if (!amountRaw) {
            alert('Please enter an amount.');
            return false;
        }
        if (!desc) {
            alert('Please enter a description.');
            return false;
        }

        const amountNum = parseFloat(amountRaw);
        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Amount must be a positive number (greater than 0).');
            return false;
        }

        const newTx = {
            id: Date.now() + Math.random().toString(36).substr(2, 4),
            amount: amountNum,
            description: desc,
            type: type,
        };

        transactions.push(newTx);
        saveTransactions();

        amountInp.value = '';
        descInp.value = '';
        typeSelect.value = 'income';

        updateSummary();
        renderList();

        return true;
    }

    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => {
            const btnFilter = btn.dataset.filter;
            if (btnFilter === filter) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        renderList();
    }

    function init() {
        loadTransactions();

        saveTransactions();
        updateSummary();
        renderList();

        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addTransaction();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                setFilter(filter);
            });
        });
    }

    init();
})();