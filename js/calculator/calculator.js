import { showCustomToast } from '../toast.js';
import { handleEqualsPress } from '../vault/vault.js';

const display = document.getElementById('display');
const exprEl = document.getElementById('expression');
const copyResultBtn = document.getElementById('copyResultBtn');

let expr = '';
let justEvaluated = false;

function formatNumber(numStr) {
    if (!numStr || typeof numStr !== 'string') return numStr;
    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : null;
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decimalPart !== null ? `${formattedIntegerPart},${decimalPart}` : formattedIntegerPart;
}

function updateDisplay() {
    exprEl.textContent = expr.includes('=') ? expr.split('=')[0] + '=' : '';
    let currentDisplay = expr.includes('=') ? expr.split('=').pop() : expr;
    display.textContent = formatNumber(currentDisplay || '0');

    if (display.textContent === '0' || display.textContent === 'HATA') {
        copyResultBtn.classList.add('hidden-icon');
    } else {
        copyResultBtn.classList.remove('hidden-icon');
    }

    requestAnimationFrame(() => {
        display.scrollLeft = display.scrollWidth;
    });
}

function pushKey(k) {
    if (justEvaluated) {
        if (/[0-9,]/.test(k)) {
            expr = '';
        } else if (expr.includes('=')) {
            expr = expr.split('=').pop();
        }
        justEvaluated = false;
    }

    if (expr === '0' && /[0-9]/.test(k) && k !== '0') {
        expr = k;
    } else if (expr === '0' && k === '0') {
        return;
    } else {
        expr += k;
    }
    justEvaluated = false;
    updateDisplay();
}

function clearAll() { expr = ''; updateDisplay(); }

function backspace() {
    if (justEvaluated) {
        expr = expr.split('=')[0] || '';
        justEvaluated = false;
    } else {
        expr = expr.slice(0, -1);
    }
    updateDisplay();
}

function handlePercentage() {
    if (justEvaluated) return;
    const exprWithDots = expr.replace(/,/g, '.');
    const match = exprWithDots.match(/([+\-×÷])?([0-9.]+)$/);
    if (match) {
        const operator = match[1];
        const lastNumber = parseFloat(match[2]);
        const baseExpr = exprWithDots.substring(0, match.index);

        if (operator === '+' || operator === '−') {
            try {
                const baseValue = safeEval(baseExpr);
                const percentageValue = baseValue * (lastNumber / 100);
                expr = expr.substring(0, match.index) + operator + String(percentageValue).replace('.', ',');
            } catch (e) { /* Ignore */ }
        } else {
            const percentageValue = lastNumber / 100;
            expr = expr.substring(0, match.index) + (operator || '') + String(percentageValue).replace('.', ',');
        }
    }
    updateDisplay();
}

function safeEval(s) {
    // Güvenlik: Sadece matematiksel karakterlere izin ver
    s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.');
    s = s.replace(/([*\/+\-])\s*([*\/+\-])/g, '$2');
    
    // Güvenlik kontrolü: Sadece sayılar, operatörler, parantezler ve boşluklar
    if (!/^[0-9+\-*/().\s]*$/.test(s)) {
        throw new Error('Invalid characters');
    }
    
    // Güvenlik: Parantez dengesini kontrol et
    let parenCount = 0;
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') parenCount++;
        if (s[i] === ')') parenCount--;
        if (parenCount < 0) throw new Error('Invalid expression');
    }
    if (parenCount !== 0) throw new Error('Invalid expression');
    
    // Güvenlik: Boş string kontrolü
    if (!s.trim()) return 0;
    
    // Function constructor kullanımı - regex kontrolü ile güvenli
    // Not: Bu kullanım güvenli çünkü sadece matematiksel ifadeler kabul ediliyor
    try {
        const result = Function('"use strict";return(' + s + ')')();
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Invalid result');
        }
        return parseFloat(result.toPrecision(15));
    } catch (e) {
        throw new Error('Invalid expression');
    }
}

function equals() {
    if (justEvaluated) return;
    let finalExpr = expr;
    try {
        const result = safeEval(finalExpr || '0');
        if (!isFinite(result)) throw new Error('');
        let resultStr = String(result);
        if (resultStr.includes('e')) {
            resultStr = result.toFixed(10).replace(/\.?0+$/, "");
        }
        expr = finalExpr + '=' + resultStr;
        justEvaluated = true;
        updateDisplay();
        exprEl.textContent = finalExpr.replace(/\*/g, '×').replace(/\//g, '÷') + '=';
        display.textContent = formatNumber(resultStr);
    } catch (error) {
        display.textContent = 'HATA';
        exprEl.textContent = finalExpr.replace(/\*/g, '×').replace(/\//g, '÷') + '=';
        justEvaluated = true;
        setTimeout(updateDisplay, 900);
    }
}

function handleKeydown(e) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }
    if (e.key === 'Enter' || e.key === '=') { equals(); handleEqualsPress(); e.preventDefault(); }
    else if (e.key === 'Backspace') { backspace(); e.preventDefault(); }
    else if (/^[0-9+\-*/().,%]$/.test(e.key)) { pushKey(e.key === '.' ? ',' : e.key); e.preventDefault(); }
}

export function initCalculator() {
    const pad = document.getElementById('pad');
    pad.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.action === 'clear') { clearAll(); return; }
        if (b.dataset.action === 'percentage') { handlePercentage(); return; }
        if (b.dataset.action === 'backspace') { backspace(); return; }
        if (b.dataset.action === 'equals') { equals(); handleEqualsPress(); return; }
        if (b.dataset.key) pushKey(b.dataset.key);
    });

    copyResultBtn.addEventListener('click', () => {
        const resultText = display.textContent;
        if (resultText === 'HATA' || resultText === '0') return;
        navigator.clipboard.writeText(resultText.replace(/\./g, '').replace(',', '.'))
            .then(() => showCustomToast('Kopyalandı!'))
            .catch(() => showCustomToast('Kopyalama başarısız oldu.'));
    });

    window.addEventListener('keydown', handleKeydown);
    updateDisplay();
}