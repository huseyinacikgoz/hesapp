(function() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeKey = 'hesapp_theme_v1';

    function applyTheme() {
        const savedTheme = localStorage.getItem(themeKey);
        if (savedTheme) {
            body.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.setAttribute('data-theme', 'dark');
            } else {
                body.removeAttribute('data-theme');
            }
        }
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.removeAttribute('data-theme');
            localStorage.setItem(themeKey, 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem(themeKey, 'dark');
        }
    });

    applyTheme();
})();

(function(){
  const display = document.getElementById('display');
  const exprEl = document.getElementById('expression');
  const copyResultBtn = document.getElementById('copyResultBtn');

  // GENELLEŞTİRİLMİŞ TOAST (UYARI) FONKSİYONU
  function showCustomToast(message) {
    if (document.querySelector('.copy-toast')) return;
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'copy-toast';
    document.querySelector('.screen').appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10); 

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000); // 2 saniye ekranda kalacak
  }
  // Kopyalama butonu, artık yeni fonksiyonu kullanıyor
  copyResultBtn.addEventListener('click', () => {
    const resultText = display.textContent;
    if (resultText === 'HATA' || resultText === '0') return;

    navigator.clipboard.writeText(resultText).then(() => {
        showCustomToast('Kopyalandı!');
    }).catch(err => {
        console.error('Kopyalama başarısız oldu: ', err);
    });
  });

  // Kasa silme fonksiyonu, artık yeni fonksiyonu kullanacak (aşağıda tanımlanıyor)
  window.showCustomToast = showCustomToast;


  let expr = '';
  let justEvaluated = false;
  
  function updateDisplay(){ 
    exprEl.textContent = expr.includes('=') ? expr.split('=')[0] + '=' : '';
    let currentDisplay = expr.includes('=') ? expr.split('=').pop() : expr;
    display.textContent = currentDisplay || '0'; 
    window._fullExpression = expr;

    if (display.textContent === '0' || display.textContent === 'HATA') {
        copyResultBtn.classList.add('hidden-icon');
    } else {
        copyResultBtn.classList.remove('hidden-icon');
    }
  }

  function pushKey(k){ 
      if(justEvaluated && /[0-9.]/.test(k)){ 
          expr=''; 
          justEvaluated=false; 
      } 
      
      if (expr === '0' && /[0-9]/.test(k) && k !== '0') {
          expr = k;
      } else {
          expr += k;
      }
      
      if(expr.includes('=') && !justEvaluated) {
      }
      
      justEvaluated = false;
      updateDisplay(); 
  }
  
  function clearAll(){ expr=''; updateDisplay(); }
  function backspace(){ 
      if (justEvaluated) {
        expr = expr.split('=')[0] || '';
        justEvaluated = false;
      } else {
        expr=expr.slice(0,-1); 
      }
      updateDisplay(); 
  }
  
  function handlePercentage() {
    if (justEvaluated) return;
    // Find the last number in the expression
    const match = expr.match(/([+\-×÷])?([0-9.]+)$/);
    if (match) {
        const operator = match[1];
        const lastNumber = parseFloat(match[2]);
        const baseExpr = expr.substring(0, match.index);

        if (operator === '+' || operator === '−') {
            // Calculate percentage of the preceding value
            try {
                const baseValue = safeEval(baseExpr);
                const percentageValue = baseValue * (lastNumber / 100);
                expr = baseExpr + operator + percentageValue;
            } catch (e) { /* Ignore if baseExpr is not evaluatable */ }
        } else {
            // Just divide the last number by 100
            const percentageValue = lastNumber / 100;
            expr = baseExpr + (operator || '') + percentageValue;
        }
    }
    updateDisplay();
  }

  function safeEval(s){ 
      s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      // Sanitize multiple operators, e.g., 5 * + 3 -> 5 + 3
      s = s.replace(/([*\/+\-])\s*([*\/+\-])/g, '$2');
      if(!/^[0-9+\-*/().\s]*$/.test(s)) throw new Error('Invalid characters in expression'); 
      const result = Function('"use strict";return('+s+')')();
      // Fix floating point precision issues
      return parseFloat(result.toPrecision(15));
  }
  
  function equals(){ 
      if (justEvaluated) return; 

      let finalExpr = expr;
      let result;
      
      try{ 
          result = safeEval(finalExpr||'0'); 
          if(!isFinite(result)) throw new Error(''); 
          
          let resultStr = String(result);
          if(resultStr.includes('e')) {
            resultStr = result.toFixed(10).replace(/\.?0+$/, "");
          }
          
          expr = finalExpr.replace(/÷/g, '/').replace(/×/g, '*') + '=' + resultStr; 
          
          justEvaluated=true; 
          updateDisplay(); 
          exprEl.textContent = finalExpr.replace(/÷/g, '÷').replace(/\*/g, '×') + '='; 
          display.textContent = resultStr; 
      }catch(error){ 
          display.textContent='HATA'; 
          exprEl.textContent = finalExpr.replace(/÷/g, '÷').replace(/\*/g, '×') + '=';
          justEvaluated = true; 
          setTimeout(updateDisplay, 900); 
      } 
  }

  const pad=document.getElementById('pad');
  pad.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b)return;
    if(b.dataset.action==='clear'){clearAll();return;}
    if(b.dataset.action==='percentage'){handlePercentage();return;}
    if(b.dataset.action==='backspace'){backspace();return;}
    if(b.dataset.action==='equals'){equals(); handleEqualsPress(); return;}
    if(b.dataset.key) pushKey(b.dataset.key);
  });
  window._calculatorKeyHandler=function(e){
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return; 
    }
    
    if(e.key==='Enter' || e.key==='='){equals(); handleEqualsPress(); e.preventDefault(); }
    else if(e.key==='Backspace'){ backspace(); e.preventDefault(); }
    else if(/^[0-9+\-*/().%]$/.test(e.key)){ pushKey(e.key); e.preventDefault(); }
  };
  
  if (!window._calculatorKeyHandlerAdded) {
      window.addEventListener('keydown', window._calculatorKeyHandler);
      window._calculatorKeyHandlerAdded = true; 
  }
  
})();

// === ONAY SİSTEMİ VE GÜNCELLENMİŞ KODLAR ===

// Bu fonksiyon, hem hesap makinesi hem de kasa mantığı tarafından kullanıldığı için global olmalı.
function handleEqualsPress(){
  // Bu fonksiyonun içindeki değişkenler (equalsPressCount, openVault) aşağıdaki IIFE içinde tanımlanacak
  // ve bu fonksiyon oradan çağrılacak.
  // Bu sadece bir placeholder, asıl işlevsellik aşağıda.
}

(function() { // Kasa mantığını kendi kapsamı içine alalım
    const modalBackdrop=document.getElementById('modalBackdrop');
const modalContent=document.getElementById('modalContent');
const modalOK=document.getElementById('modalOK');
const modalCancel=document.getElementById('modalCancel'); 
const leftActions = document.getElementById('leftActions');
const modalNote=document.getElementById('modalNote');
const modalTitle=document.getElementById('modalTitle');
const infoBtn = document.getElementById('infoBtn'); 
const vaultCloseBtn = document.getElementById('vaultCloseBtn'); 
const securityBackdrop = document.getElementById('securityBackdrop'); 
const securityClose = document.getElementById('securityClose');
const infoDropdownContainer = document.getElementById('infoDropdownContainer');
const settingsDropdownContainer = document.getElementById('settingsDropdownContainer');
const settingsBtn = document.getElementById('settingsBtn');
const infoDropdown = document.getElementById('infoDropdown');
const disclaimerClose = document.getElementById('disclaimerClose');
const disclaimerOK = document.getElementById('disclaimerOK');
const securityOK = document.getElementById('securityOK');
const openDisclaimerFromSecurity = document.getElementById('openDisclaimerFromSecurity');
const acceptTermsBtn = document.getElementById('acceptTermsBtn');
const cancelTermsBtn = document.getElementById('cancelTermsBtn');
const STORAGE_KEY='kasa_encrypted_v1';
const TERMS_KEY = 'hesapp_terms_accepted_v1';
let equalsPressCount=0;

// Onay Modalı Elementleri
const confirmBackdrop = document.getElementById('confirmBackdrop');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOK = document.getElementById('confirmOK');
const confirmCancel = document.getElementById('confirmCancel');
let confirmationResolver;

// Onay Modalı Fonksiyonları
function showConfirmation(message, okText = 'Evet, Sil', cancelText = 'İptal') {
    confirmMessage.innerHTML = message;
    confirmOK.textContent = okText;
    confirmCancel.textContent = cancelText;

    // Buton stillerini ayarla
    confirmOK.className = okText.includes('Sil') || okText.includes('Yükle') ? 'delete-btn' : 'vault-btn';
    if (okText.includes('Yükle')) {
        confirmOK.style.backgroundColor = 'var(--accent)';
    } else {
        confirmOK.style.backgroundColor = 'var(--delete-btn)';
    }

    confirmBackdrop.style.display = 'flex';
    return new Promise(resolve => {
        confirmationResolver = resolve;
    });
}

confirmOK.onclick = () => { confirmBackdrop.style.display = 'none'; if (confirmationResolver) confirmationResolver(true); };
confirmCancel.onclick = () => { confirmBackdrop.style.display = 'none'; if (confirmationResolver) confirmationResolver(false); };


function bufToBase64(buf){ return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function base64ToBuf(b64){ return Uint8Array.from(atob(b64),c=>c.charCodeAt(0)); }
async function getKeyFromPassword(password,salt){ const pwUtf8=new TextEncoder().encode(password); const baseKey=await crypto.subtle.importKey('raw',pwUtf8,'PBKDF2',false,['deriveKey']); return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},baseKey,{name:'AES-GCM',length:256},false,['encrypt','decrypt']); } 
async function encryptMessage(password,plainText){ const salt=crypto.getRandomValues(new Uint8Array(16)); const iv=crypto.getRandomValues(new Uint8Array(12)); const key=await getKeyFromPassword(password,salt); const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(plainText)); return {salt:bufToBase64(salt),iv:bufToBase64(iv),ct:bufToBase64(ct)}; }
async function decryptMessage(password,data){ const salt=base64ToBuf(data.salt); const iv=base64ToBuf(data.iv); const ct=base64ToBuf(data.ct); const key=await getKeyFromPassword(password,salt); 
    try {
        const plainBuf=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,ct); 
        return new TextDecoder().decode(plainBuf); 
    } catch (e) {
        throw new Error("Decryption failed");
    }
}
function hasVault(){ return Boolean(localStorage.getItem(STORAGE_KEY)); }

function showModal(html,note='',isError=false, showDelete=false, showInfo=false, showBack=false, isWarning=false, showSettings = false){ 
    modalContent.innerHTML=html; 
    modalNote.textContent=note; 
    modalNote.classList.toggle('error', isError); 
    modalNote.classList.toggle('warning', isWarning);
    modalBackdrop.style.display='flex'; 
    
    // Başlık hizalaması ve geri butonu yönetimi
    const titleEl = document.getElementById('modalTitle');
    const headerEl = titleEl.parentElement;
    const vaultBackBtn = document.getElementById('vaultBackBtn'); // Bu satır zaten vardı, tekrar tanımlamaya gerek yok ama zararı da yok.
    headerEl.style.justifyContent = showBack ? 'space-between' : 'space-between'; // Keep space-between
    titleEl.style.textAlign = showBack ? 'center' : 'left';

    leftActions.innerHTML = '';

    if (showDelete) {
        const deleteVaultBtn = document.createElement('button');
        deleteVaultBtn.id = 'deleteVaultBtn';
        deleteVaultBtn.className = 'delete-btn';
        deleteVaultBtn.textContent = 'Kasayı Sil';
        deleteVaultBtn.onclick = async () => {
            const confirmed = await showConfirmation("🚨 <strong>DİKKAT:</strong> Gizli kasayı ve <strong>TÜM MESAJLARI</strong> kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!");
            if (confirmed) {
                try {
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem(TERMS_KEY);
                    hideModal();
                    // ESKİ ALERT DEĞİŞTİRİLDİ: Yeni toast fonksiyonu çağrılıyor.
                    window.showCustomToast('Kasa başarıyla silindi!');
                } catch (e) {
                    alert('⚠️ Hata: Yerel depolama alanına erişilemiyor veya silme başarısız oldu.');
                }
            }
        };
        leftActions.appendChild(deleteVaultBtn);
    }
    
    infoDropdownContainer.style.display = showInfo ? 'inline-block' : 'none';
    settingsDropdownContainer.style.display = showSettings ? 'inline-block' : 'none';
    
    vaultBackBtn.style.display = showBack ? 'flex' : 'none'; 
    
    modalOK.style.display = 'inline-block';
    modalOK.classList.add('vault-btn');
    modalOK.classList.remove('action-toggle-btn');

    modalCancel.style.display = 'none';

    if(window._calculatorKeyHandlerAdded) {
        window.removeEventListener('keydown', window._calculatorKeyHandler); 
    }
    
    setTimeout(()=>{ 
        const firstInput = modalBackdrop.querySelector('input, textarea'); 
        if(firstInput) firstInput.focus();
        
        // Enter tuşu dinleyicisini modal içindeki tüm inputlara ekle
        const inputs = modalBackdrop.querySelectorAll('input[type="password"], input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('keydown', modalInputKeyHandler);
        });

    },40);
}

function hideModal(){ 
    modalBackdrop.style.display='none'; 
    securityBackdrop.style.display='none'; 
    infoDropdown.classList.remove('show-dropdown');
    document.getElementById('settingsDropdown').classList.remove('show-dropdown');
    
    // Modal keydown handler'ı kaldır
    const inputs = modalBackdrop.querySelectorAll('input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        input.removeEventListener('keydown', modalInputKeyHandler);
    });

    preLoginTermsBackdrop.style.display = 'none';
    
    if(window._calculatorKeyHandlerAdded) {
         window.addEventListener('keydown', window._calculatorKeyHandler);
    }
}

function showDisclaimerModal() { disclaimerBackdrop.style.display = 'flex'; }
function hideDisclaimerModal() { disclaimerBackdrop.style.display = 'none'; }

function showPreLoginTermsModal() { preLoginTermsBackdrop.style.display = 'flex'; }
function hidePreLoginTermsModal() { preLoginTermsBackdrop.style.display = 'none'; }

function showSecurityModal(){ 
    securityBackdrop.style.display = 'flex'; 
    if(window._calculatorKeyHandlerAdded) {
        window.removeEventListener('keydown', window._calculatorKeyHandler); 
    }
}

securityClose.onclick = () => {
    securityBackdrop.style.display = 'none'; 
    modalBackdrop.style.display='flex'; 
    
    setTimeout(()=>{ 
        const firstInput = modalBackdrop.querySelector('input, textarea'); 
        if(firstInput) firstInput.focus(); 
    },40);
};

vaultCloseBtn.onclick = hideModal;

// Inputlar için Enter tuşu yöneticisi
function modalInputKeyHandler(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (modalOK.onclick && typeof modalOK.onclick === 'function') {
            modalOK.onclick();
        }
    }
}

// Dropdown Menü Mantığı
function setupDropdown(trigger, dropdown) {
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const otherDropdowns = document.querySelectorAll('.dropdown-content.show-dropdown');
    otherDropdowns.forEach(dd => {
      if (dd !== dropdown) {
        dd.classList.remove('show-dropdown');
      }
    });
    dropdown.classList.toggle('show-dropdown');
  });
}

setupDropdown(infoBtn, infoDropdown);
setupDropdown(settingsBtn, document.getElementById('settingsDropdown'));

window.addEventListener('click', (event) => {
    if (!event.target.matches('.info-btn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show-dropdown')) {
                openDropdown.classList.remove('show-dropdown');
            }
        }
    }
});

document.getElementById('securityInfoLink').onclick = (e) => { e.preventDefault(); showSecurityModal(); };
document.getElementById('termsInfoLink').onclick = (e) => { e.preventDefault(); showDisclaimerModal(); };
document.getElementById('aboutLink').onclick = (e) => { e.preventDefault(); showAboutModal(); };


// Eski infoBtn.onclick kaldırıldı, yeni dropdown linkleri kullanılıyor.
// infoBtn.onclick = showSecurityModal; 

disclaimerClose.onclick = hideDisclaimerModal;
disclaimerOK.onclick = hideDisclaimerModal;
securityOK.onclick = () => { securityBackdrop.style.display = 'none'; };

const aboutBackdrop = document.getElementById('aboutBackdrop');
const aboutClose = document.getElementById('aboutClose');
function showAboutModal() { aboutBackdrop.style.display = 'flex'; }
aboutClose.onclick = () => { aboutBackdrop.style.display = 'none'; };



cancelTermsBtn.onclick = hidePreLoginTermsModal;

acceptTermsBtn.onclick = () => {
    localStorage.setItem(TERMS_KEY, 'true');
    hidePreLoginTermsModal();
    openVaultAccessMode();
};

function openVault(){ 
    const termsAccepted = localStorage.getItem(TERMS_KEY) === 'true';
    if (!termsAccepted) {
        showPreLoginTermsModal();
    } else {
        openVaultAccessMode();
    }
}

async function handleVaultSetup(){
    const p1=document.getElementById('pw1').value||'';
    const p2=document.getElementById('pw2').value||'';
    
    if(p1.length < 8) { 
         showModal(modalContent.innerHTML,'Lütfen en az 8 karakterden oluşan güçlü bir şifre belirleyin.', true, false, true, false); 
         return;
    }

    if(p1!==p2){ showModal(modalContent.innerHTML,'Şifreler eşleşmiyor', true, false, true, false); return; }

    try {
        const initialData = JSON.stringify([]);
        const enc=await encryptMessage(p1, initialData);
        try {
            localStorage.setItem(STORAGE_KEY,JSON.stringify(enc));
            localStorage.setItem(TERMS_KEY, 'true');
            showVaultManagementScreen(p1, []); 
        } catch (e) {
             showModal(modalContent.innerHTML,'⚠️ Hata: Depolama alanına yazılamadı (Kotanız dolu olabilir ya da Gizli Mod açık olabilir).', true, false, true, false);
        }
        
    } catch(e) {
        alert('Kasa kurulumunda beklenmeyen bir şifreleme hatası oluştu.');
    }
}

async function handleVaultUnlock(){
    const pwVal = document.getElementById('pw').value||'';
    
    if(pwVal.length === 0) {
        modalNote.textContent = 'Lütfen şifrenizi girin.';
        modalNote.classList.add('error');
        modalOK.style.display = 'inline-block'; 
        return; 
    }
    
    modalOK.style.display = 'none';

    try{
        const enc=JSON.parse(localStorage.getItem(STORAGE_KEY));
        const plainJson = await decryptMessage(pwVal, enc);
        const messages = JSON.parse(plainJson);

        showVaultManagementScreen(pwVal, messages); 
        
    }catch(e){
        modalOK.style.display = 'inline-block'; 
        modalNote.textContent = 'Hatalı şifre. Lütfen tekrar deneyin.'; modalNote.classList.add('error');
    }
}

function openVaultAccessMode(){
    if (hasVault()) {
        modalTitle.textContent = "Kasa Girişi";
        showModal(`
            <div class="field"><label>Şifre:</label><input id="pw" type="password" autocomplete="off"></div> 
        `,'Kasanızı açmak için şifrenizi girin.', false, false, true, false);
        
        modalOK.textContent = 'Giriş Yap';
        modalOK.onclick = handleVaultUnlock; 
        
    } else {
        modalTitle.textContent = "Kasa Kurulumu";
        showModal(`
            <div class="field"><label>Kasa Şifreniz (En az 8 karakter):</label><input id="pw1" type="password" autocomplete="off"></div> 
            <div class="field"><label>Şifrenizi Doğrulayın:</label><input id="pw2" type="password" autocomplete="off"></div> 
            <div class="no-recovery-warning">
                ⚠️ <strong>Bu şifre, kasanızın tek anahtarıdır.</strong> Unutmanız durumunda verilerinize erişmenin başka bir yolu yoktur. Lütfen güvende olduğundan emin olun.
            </div>
        `,'', false, false, true, false);
        
        modalOK.textContent = 'Şifreyi Kaydet';
        modalOK.onclick = handleVaultSetup; 
    }
    vaultBackBtn.style.display = 'none';
    
    // Sadece yeni kasa kurulumunda geri yükleme seçeneği göster
    if (!hasVault()) {
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'action-toggle-btn';
        restoreBtn.textContent = 'Yedekten Geri Yükle';
        restoreBtn.onclick = handleImport;
        leftActions.innerHTML = ''; // Önce temizle
        leftActions.appendChild(restoreBtn);
    }
}

function handleExport() {
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    if (!encryptedData) {
        window.showCustomToast('Yedeklenecek veri bulunamadı.');
        return;
    }

    const blob = new Blob([encryptedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    a.download = `hesapp-kasa-yedek-${dateString}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showCustomToast('Yedekleme dosyası indiriliyor...');
}

function handleImport() {
    const fileInput = document.getElementById('importFileInput');
    fileInput.onchange = async e => {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        try {
            const data = JSON.parse(text);
            if (!data.salt || !data.iv || !data.ct) {
                throw new Error('Invalid file format');
            }

            const confirmed = await showConfirmation(
                "<strong>DİKKAT:</strong> Bu işlem, mevcut kasanızdaki (varsa) <strong>tüm notları kalıcı olarak silecek</strong> ve yedek dosyasındaki verilerle değiştirecektir." +
                "<br><br>" +
                "<strong>Veri kaybı yaşamamak için:</strong> Eğer mevcut kasanızda önemli notlarınız varsa, bu işleme devam etmeden önce <strong>mevcut kasanızı yedeklediğinizden</strong> emin olun." +
                "<br><br>Devam etmek istiyor musunuz?",
                'Evet, Geri Yükle', 'Vazgeç'
            );
            if (confirmed) {
                localStorage.setItem(STORAGE_KEY, text);
                localStorage.setItem(TERMS_KEY, 'true'); // Yedek yüklenince koşulları kabul etmiş sayalım
                hideModal();
                window.showCustomToast('Kasa başarıyla geri yüklendi!');
            }

        } catch (err) {
            alert('Hata: Geçersiz veya bozuk yedekleme dosyası.');
        } finally {
            // Input'u sıfırla ki aynı dosya tekrar seçilebilsin
            fileInput.value = '';
        }
    };
    fileInput.click();
}

function showVaultManagementScreen(password, messages) {
    modalTitle.textContent = "Kasa Yönetimi";
    showModal('', '', false, false, true, false, false, true);

    // Arama kutusu ve not listesini içeren ana HTML yapısı
    modalContent.innerHTML = `
        ${messages.length > 0 ? `
        <div class="search-field">
            <span class="search-icon">🔍</span>
            <input type="text" id="noteSearchInput" placeholder="Notlarda ara..." autocomplete="off">
        </div>` : ''}
        <div id="messageList" style="max-height: 250px; overflow-y: auto; margin-bottom: 15px;">
        </div>
    `;

    const messageListContainer = document.getElementById('messageList');
    const searchInput = document.getElementById('noteSearchInput');

    // Notları en yeniden en eskiye doğru sırala
    const sortedMessages = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Not listesini render eden fonksiyon
    function renderMessageList(filteredMessages) {
        const noResultMessage = searchInput && searchInput.value ? 'Aramanızla eşleşen not bulunamadı.' : 'Henüz bir not eklenmedi.';
        
        let listHtml = filteredMessages.length > 0 ? filteredMessages.map(msg => {
            // Orijinal indeksi bulmak için sıralanmamış `messages` dizisini kullan
            const originalIndex = messages.indexOf(msg);
            const date = new Date(msg.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            return `
            <div class="message-item view-btn" data-index="${originalIndex}" style="display:flex; justify-content:space-between; align-items:center; padding:12px 5px; border-bottom:1px solid var(--modal-border); cursor: pointer;">
                <span class="view-title" data-index="${originalIndex}" style="font-weight:600; color:var(--accent); max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${msg.title || 'Başlıksız Not'}</span>
                <div style="font-size: 13px; color: var(--muted);">
                    ${formattedDate}
                </div>
            </div>
        `}).join('') : `<p style="color:var(--muted); text-align:center; margin-top:20px;">${noResultMessage}</p>`;

        messageListContainer.innerHTML = listHtml;

        // Olay dinleyicilerini yeniden bağla
        const viewHandler = (e) => {
            const originalIndex = parseInt(e.currentTarget.dataset.index);
            showMessageEditor(password, messages, originalIndex);
        };
        messageListContainer.querySelectorAll('.message-item').forEach(item => item.onclick = viewHandler);
    }

    // Arama olay dinleyicisi
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = sortedMessages.filter(msg => 
                (msg.title && msg.title.toLowerCase().includes(searchTerm)) || 
                (msg.content && msg.content.toLowerCase().includes(searchTerm))
            );
            renderMessageList(filtered);
        });
    }

    // Başlangıçta sıralanmış notları göster
    renderMessageList(sortedMessages);

    // Ayarlar menüsü butonlarına olayları bağla
    document.getElementById('exportBtn').onclick = (e) => { e.preventDefault(); handleExport(); };
    document.getElementById('importBtn').onclick = (e) => { e.preventDefault(); handleImport(); };
    document.getElementById('deleteVaultBtnDropdown').onclick = async (e) => {
        e.preventDefault();
        const confirmed = await showConfirmation("🚨 <strong>DİKKAT:</strong> Gizli kasayı ve <strong>TÜM MESAJLARI</strong> kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!");
        if (confirmed) {
            try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(TERMS_KEY);
                hideModal();
                window.showCustomToast('Kasa başarıyla silindi!');
            } catch (err) {
                alert('⚠️ Hata: Yerel depolama alanına erişilemiyor veya silme başarısız oldu.');
            }
        }
    };

    modalOK.textContent = 'Yeni Not Ekle';
    modalOK.onclick = () => showMessageEditor(password, messages, -1);
}

function showMessageEditor(password, messages, index){
    const isNew = index === -1;
    const msg = isNew ? { title: '', content: '', date: new Date().toISOString() } : messages[index];
    const isEditing = index !== -1; 
    
    let isCurrentlyEditing = isNew; 
    
    modalNote.textContent = '';
    infoDropdownContainer.style.display = 'none';
    settingsDropdownContainer.style.display = 'none';

    vaultBackBtn.onclick = () => showVaultManagementScreen(password, messages);

    modalContent.innerHTML = `
        <div class="field"><label>Başlık:</label><input id="msgTitle" type="text" value="${msg.title}" placeholder="Not Başlığı (Opsiyonel)"></div>
        <div class="field">
            <label>İçerik:</label>
            <div class="copy-container"> 
                <textarea id="msgContent" rows="5" placeholder="Gizli mesajınızın içeriği">${msg.content}</textarea>
                ${isEditing ? `<button class="icon-btn copy-btn" id="copyMsgBtn" title="Panoya Kopyala">📋</button>` : ''}
            </div>
        </div>
        <div class="note" id="lastModifiedDate" style="text-align: right; margin-top: 0;"></div>
    `;
    
    leftActions.innerHTML = '';
    
    function updateEditorMode(isEditMode) {
        const date = new Date(msg.date);
        const formattedDate = `Son değişiklik: ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        document.getElementById('lastModifiedDate').textContent = isNew ? '' : formattedDate;

        if (!isEditMode && !isNew) {
            // "Vazgeç" durumunda orijinal verileri geri yükle
            document.getElementById('msgTitle').value = msg.title;
            document.getElementById('msgContent').value = msg.content;
        }

        document.getElementById('msgTitle').readOnly = !isEditMode;
        document.getElementById('msgContent').readOnly = !isEditMode;

        vaultBackBtn.style.display = !isEditMode && !isNew ? 'flex' : 'none'; 

        leftActions.innerHTML = '';

        if (isNew) {
            modalOK.textContent = 'Kaydet';
            modalOK.onclick = () => handleSaveMessage(password, messages, index);
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'action-toggle-btn';
            cancelBtn.textContent = 'Vazgeç';
            cancelBtn.onclick = () => showVaultManagementScreen(password, messages);
            leftActions.appendChild(cancelBtn);
            modalTitle.textContent = "Yeni Not Ekle";
            
        } else if (isEditMode) {
            modalTitle.textContent = "Notu Düzenle";
            modalOK.textContent = 'Güncelle';
            modalOK.onclick = () => handleSaveMessage(password, messages, index);
            
            const cancelEditBtn = document.createElement('button');
            cancelEditBtn.className = 'action-toggle-btn';
            cancelEditBtn.textContent = 'Vazgeç';
            cancelEditBtn.onclick = () => updateEditorMode(false);
            leftActions.appendChild(cancelEditBtn);
            
        } else {
            modalTitle.textContent = "Not";
            modalOK.textContent = 'Düzenle'; 
            modalOK.onclick = () => updateEditorMode(true); 
            
            const deleteNoteBtn = document.createElement('button');
            deleteNoteBtn.className = 'delete-btn';
            deleteNoteBtn.textContent = 'Notu Sil';
            deleteNoteBtn.onclick = () => handleDeleteMessage(password, messages, index);
            leftActions.appendChild(deleteNoteBtn);

            const copyBtn = document.getElementById('copyMsgBtn');
            if (copyBtn) {
                copyBtn.onclick = (e) => copyMessageToClipboard(msg.content, e.target);
            }
        }
    }

    updateEditorMode(isCurrentlyEditing);
}

async function handleSaveMessage(password, messages, index){
    const title = document.getElementById('msgTitle').value.trim();
    const content = document.getElementById('msgContent').value.trim();
    
    if(content === ''){ 
        modalNote.textContent = 'Mesaj içeriği boş olamaz!'; modalNote.classList.add('error'); 
        return; 
    }

    let finalTitle = title;
    if (!finalTitle) {
        const baseTitle = 'Başlıksız Not';
        const untitledNotes = messages.filter(m => m.title.startsWith(baseTitle));
        if (untitledNotes.length === 0) {
            finalTitle = baseTitle;
        } else {
            let counter = 2;
            while (untitledNotes.some(m => m.title === `${baseTitle} ${counter}`)) {
                counter++;
            }
            finalTitle = `${baseTitle} ${counter}`;
        }
    }
    const newMessage = { title: finalTitle, content: content, date: new Date().toISOString() };

    if (index === -1) {
        messages.push(newMessage); 
    } else {
        messages[index] = newMessage; 
    }

    const encData = JSON.stringify(messages);
    
    try {
        const enc = await encryptMessage(password, encData);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
            showVaultManagementScreen(password, messages);
        } catch (e) {
             showModal(modalContent.innerHTML,'⚠️ Hata: Depolama alanına yazılamadı (Kotanız dolu olabilir veya Gizli Mod açık olabilir).', true, false, false, true);
        }
    } catch(e) {
        modalNote.textContent = '⚠️ Hata: Şifreleme/kayıt işlemi başarısız oldu.';
        modalNote.classList.add('error');
    }
}

async function handleDeleteMessage(password, messages, index){
    const confirmed = await showConfirmation("Bu gizli notu kalıcı olarak silmek istediğinizden emin misiniz?");
    if (confirmed) {
        messages.splice(index, 1);
        
        const encData = JSON.stringify(messages);
        
        try {
            const enc = await encryptMessage(password, encData);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
                showVaultManagementScreen(password, messages);
            } catch (e) {
                 alert('⚠️ Hata: Silme sonrası depolama alanına yazılamadı. Lütfen tekrar deneyin.');
            }
        } catch (e) {
            alert('⚠️ Hata: Silme sonrası şifreleme başarısız oldu.');
        }
    }
}

function copyMessageToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text)
        .then(() => { 
            const originalText = '📋';
            buttonElement.textContent = '✅'; 
            setTimeout(() => { buttonElement.textContent = originalText; }, 1500); 
        });
}


// Global handleEqualsPress fonksiyonunu, bu kapsamdaki değişkenlerle çalışacak şekilde yeniden tanımlıyoruz.
window.handleEqualsPress = function() {
    equalsPressCount++;
    setTimeout(() => { equalsPressCount = 0; }, 1500);
    if (equalsPressCount >= 3) { equalsPressCount = 0; openVault(); }
};

const welcomeBackdrop = document.getElementById('welcomeBackdrop');
const welcomeClose = document.getElementById('welcomeClose');
const dontShowAgain = document.getElementById('dontShowAgain');
const WELCOME_KEY = 'kasa_welcome_v1'; 

if (localStorage.getItem(WELCOME_KEY) !== 'true') {
    if(window._calculatorKeyHandlerAdded) {
        window.removeEventListener('keydown', window._calculatorKeyHandler); 
    }
    welcomeBackdrop.style.display='flex'; 
} else {
    welcomeBackdrop.style.display='none'; 
}

welcomeClose.onclick = () => { 
    if (dontShowAgain.checked) {
        localStorage.setItem(WELCOME_KEY, 'true');
    }
    welcomeBackdrop.style.display='none'; 
    if(window._calculatorKeyHandlerAdded) {
         window.addEventListener('keydown', window._calculatorKeyHandler); 
    }
}
})();