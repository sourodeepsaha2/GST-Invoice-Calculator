/**
 * script.js - Application Logic
 * GST & Invoice Calculator (TaxHero)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('inv-date').value = today;

  // -------------------------------------------------------------
  // Theme Toggle Logic
  // -------------------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  
  // Check local storage for saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
    }
  }

  // -------------------------------------------------------------
  // Currency Formatter Helper
  // -------------------------------------------------------------
  const indianRupeeFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function formatRupees(amount) {
    return indianRupeeFormatter.format(amount || 0);
  }

  // -------------------------------------------------------------
  // GST Calculator Core Logic
  // -------------------------------------------------------------
  const gstAmountInput = document.getElementById('gst-amount');
  const gstRateSelect = document.getElementById('gst-rate-select');
  const customRateContainer = document.getElementById('custom-rate-container');
  const gstCustomRateInput = document.getElementById('gst-custom-rate');
  const gstModeSelector = document.getElementById('gst-mode-selector');
  const btnGstCalculate = document.getElementById('btn-gst-calculate');
  const btnGstReset = document.getElementById('btn-gst-reset');

  // Output elements
  const outOriginalAmt = document.getElementById('result-original-amt');
  const outCgst = document.getElementById('result-cgst');
  const outSgst = document.getElementById('result-sgst');
  const outTotalGst = document.getElementById('result-total-gst');
  const outFinalAmt = document.getElementById('result-final-amt');

  let currentGstMode = 'add'; // 'add' (exclusive) or 'remove' (inclusive)

  // Toggle option selectors for mode
  gstModeSelector.addEventListener('click', (e) => {
    const option = e.target.closest('.toggle-option');
    if (!option) return;

    // Toggle active classes
    gstModeSelector.querySelectorAll('.toggle-option').forEach(opt => {
      opt.classList.remove('active');
    });
    option.classList.add('active');
    
    currentGstMode = option.dataset.mode;
    calculateGST();
  });

  // Toggle custom rate input visibility
  gstRateSelect.addEventListener('change', () => {
    if (gstRateSelect.value === 'custom') {
      customRateContainer.style.display = 'block';
      gstCustomRateInput.focus();
    } else {
      customRateContainer.style.display = 'none';
    }
    calculateGST();
  });

  // Trigger calculations on keyboard inputs
  [gstAmountInput, gstCustomRateInput].forEach(element => {
    element.addEventListener('input', calculateGST);
  });

  btnGstCalculate.addEventListener('click', calculateGST);
  
  btnGstReset.addEventListener('click', () => {
    gstAmountInput.value = '10000';
    gstRateSelect.value = '18';
    customRateContainer.style.display = 'none';
    gstCustomRateInput.value = '';
    
    // reset mode to 'add'
    gstModeSelector.querySelectorAll('.toggle-option').forEach(opt => {
      opt.classList.remove('active');
    });
    gstModeSelector.querySelector('[data-mode="add"]').classList.add('active');
    currentGstMode = 'add';

    calculateGST();
  });

  function calculateGST() {
    const inputAmount = parseFloat(gstAmountInput.value);
    
    // Early exit check
    if (isNaN(inputAmount) || inputAmount < 0) {
      outOriginalAmt.textContent = formatRupees(0);
      outCgst.textContent = formatRupees(0);
      outSgst.textContent = formatRupees(0);
      outTotalGst.textContent = formatRupees(0);
      outFinalAmt.textContent = formatRupees(0);
      return;
    }

    // Get selected or custom rate
    let rate = 0;
    if (gstRateSelect.value === 'custom') {
      rate = parseFloat(gstCustomRateInput.value) || 0;
    } else {
      rate = parseFloat(gstRateSelect.value) || 0;
    }

    let originalAmount = 0;
    let cgst = 0;
    let sgst = 0;
    let totalGst = 0;
    let finalAmount = 0;

    if (currentGstMode === 'add') {
      // Exclusive of tax: calculate tax on top of amount
      originalAmount = inputAmount;
      totalGst = originalAmount * (rate / 100);
      finalAmount = originalAmount + totalGst;
    } else {
      // Inclusive of tax: extract tax from amount
      originalAmount = inputAmount / (1 + (rate / 100));
      totalGst = inputAmount - originalAmount;
      finalAmount = inputAmount;
    }

    cgst = totalGst / 2;
    sgst = totalGst / 2;

    // Display formatted results
    outOriginalAmt.textContent = formatRupees(originalAmount);
    outCgst.textContent = formatRupees(cgst);
    outSgst.textContent = formatRupees(sgst);
    outTotalGst.textContent = formatRupees(totalGst);
    outFinalAmt.textContent = formatRupees(finalAmount);
  }

  // Run initial GST calculation
  calculateGST();


  // -------------------------------------------------------------
  // Invoice Builder Logic
  // -------------------------------------------------------------
  const lineItemsTbody = document.getElementById('line-items-tbody');
  const btnAddItem = document.getElementById('btn-add-item');
  
  // UI output totals
  const invSubtotalEl = document.getElementById('inv-subtotal');
  const invSgstEl = document.getElementById('inv-sgst');
  const invCgstEl = document.getElementById('inv-cgst');
  const invTotalGstEl = document.getElementById('inv-total-gst');
  const invGrandTotalEl = document.getElementById('inv-grand-total');

  // Internal state array for item rows
  let lineItems = [
    {
      id: 1,
      description: 'Web Application Design & Implementation',
      qty: 1,
      rate: 45000,
      gst: 18
    },
    {
      id: 2,
      description: 'Monthly Cloud Infrastructure Maintenance',
      qty: 3,
      rate: 2500,
      gst: 18
    }
  ];

  // Unique ID tracker
  let nextRowId = 3;

  function renderLineItems() {
    lineItemsTbody.innerHTML = '';
    
    lineItems.forEach((item, index) => {
      const row = document.createElement('tr');
      row.dataset.id = item.id;
      
      const lineSubtotal = item.qty * item.rate;
      
      row.innerHTML = `
        <td>
          <input type="text" class="form-input no-addon inv-item-desc" value="${escapeHtml(item.description)}" placeholder="Item description" required style="padding: 0.5rem;">
        </td>
        <td>
          <input type="number" class="form-input no-addon inv-item-qty" value="${item.qty}" min="0" step="any" required style="padding: 0.5rem; text-align: center;">
        </td>
        <td>
          <input type="number" class="form-input no-addon inv-item-rate" value="${item.rate}" min="0" step="any" required style="padding: 0.5rem;">
        </td>
        <td>
          <select class="form-select inv-item-gst" style="padding: 0.5rem; background-position: right 0.5rem center;">
            <option value="0" ${item.gst === 0 ? 'selected' : ''}>0%</option>
            <option value="5" ${item.gst === 5 ? 'selected' : ''}>5%</option>
            <option value="12" ${item.gst === 12 ? 'selected' : ''}>12%</option>
            <option value="18" ${item.gst === 18 ? 'selected' : ''}>18%</option>
            <option value="28" ${item.gst === 28 ? 'selected' : ''}>28%</option>
          </select>
        </td>
        <td style="text-align: right; font-weight: 600; color: var(--text-main)" class="inv-item-total">
          ${formatRupees(lineSubtotal)}
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-delete-row" title="Delete Row" aria-label="Delete line item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;
      
      // Wire up row input listeners
      const descInput = row.querySelector('.inv-item-desc');
      const qtyInput = row.querySelector('.inv-item-qty');
      const rateInput = row.querySelector('.inv-item-rate');
      const gstSelect = row.querySelector('.inv-item-gst');
      const deleteBtn = row.querySelector('.btn-delete-row');
      
      descInput.addEventListener('input', (e) => {
        item.description = e.target.value;
      });
      
      qtyInput.addEventListener('input', (e) => {
        item.qty = parseFloat(e.target.value) || 0;
        updateRowTotalAndTotals(row, item);
      });
      
      rateInput.addEventListener('input', (e) => {
        item.rate = parseFloat(e.target.value) || 0;
        updateRowTotalAndTotals(row, item);
      });
      
      gstSelect.addEventListener('change', (e) => {
        item.gst = parseFloat(e.target.value) || 0;
        calculateInvoiceTotals();
      });
      
      deleteBtn.addEventListener('click', () => {
        lineItems = lineItems.filter(li => li.id !== item.id);
        renderLineItems();
        calculateInvoiceTotals();
      });

      lineItemsTbody.appendChild(row);
    });

    calculateInvoiceTotals();
  }

  function updateRowTotalAndTotals(rowEl, item) {
    const lineSubtotal = item.qty * item.rate;
    rowEl.querySelector('.inv-item-total').textContent = formatRupees(lineSubtotal);
    calculateInvoiceTotals();
  }

  function calculateInvoiceTotals() {
    let subtotal = 0;
    let totalGst = 0;

    lineItems.forEach(item => {
      const lineSubtotal = item.qty * item.rate;
      const lineTax = lineSubtotal * (item.gst / 100);
      
      subtotal += lineSubtotal;
      totalGst += lineTax;
    });

    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const grandTotal = subtotal + totalGst;

    // Update screen summaries
    invSubtotalEl.textContent = formatRupees(subtotal);
    invSgstEl.textContent = formatRupees(sgst);
    invCgstEl.textContent = formatRupees(cgst);
    invTotalGstEl.textContent = formatRupees(totalGst);
    invGrandTotalEl.textContent = formatRupees(grandTotal);
  }

  // Add Item Click
  btnAddItem.addEventListener('click', () => {
    lineItems.push({
      id: nextRowId++,
      description: '',
      qty: 1,
      rate: 0,
      gst: 18
    });
    renderLineItems();
  });

  // Render initial demo invoice items
  renderLineItems();


  // -------------------------------------------------------------
  // Invoice Rendering and Exporter Engine (PDF generation)
  // -------------------------------------------------------------
  const previewBackdrop = document.getElementById('preview-backdrop');
  const btnClosePreview = document.getElementById('btn-close-preview');
  const btnPreviewInvoice = document.getElementById('btn-preview-invoice');
  const btnDownloadPdf = document.getElementById('btn-download-pdf');

  // Input bindings
  const invBizNameInput = document.getElementById('inv-biz-name');
  const invBizAddrInput = document.getElementById('inv-biz-addr');
  const invBizGstinInput = document.getElementById('inv-biz-gstin');
  const invClientNameInput = document.getElementById('inv-client-name');
  const invClientAddrInput = document.getElementById('inv-client-addr');
  const invNumberInput = document.getElementById('inv-number');
  const invDateInput = document.getElementById('inv-date');

  // PDF output table body & summary fields
  const pdfTbody = document.getElementById('pdf-table-tbody');
  
  // Trigger dialog display
  btnPreviewInvoice.addEventListener('click', () => {
    syncInvoiceTemplate();
    previewBackdrop.classList.add('show');
  });

  btnClosePreview.addEventListener('click', () => {
    previewBackdrop.classList.remove('show');
  });

  // Close preview on clicking backdrop background
  previewBackdrop.addEventListener('click', (e) => {
    if (e.target === previewBackdrop) {
      previewBackdrop.classList.remove('show');
    }
  });

  // Compile PDF via html2pdf
  btnDownloadPdf.addEventListener('click', () => {
    syncInvoiceTemplate();
    
    const invoiceNum = invNumberInput.value.trim() || 'INVOICE';
    const element = document.getElementById('invoice-pdf-template');
    
    // Set custom configurations for html2pdf
    const options = {
      margin:       12,
      filename:     `Invoice_${invoiceNum}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2.5, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Run library execution
    html2pdf().from(element).set(options).save();
  });

  function syncInvoiceTemplate() {
    // Basic Details Sync
    document.getElementById('pdf-header-logo-text').textContent = (invBizNameInput.value || 'DIGITAL HEROES').toUpperCase();
    document.getElementById('pdf-from-name').textContent = invBizNameInput.value || 'Your Business Name';
    document.getElementById('pdf-from-addr').textContent = invBizAddrInput.value || 'Your Business Address';
    document.getElementById('pdf-from-gstin').textContent = invBizGstinInput.value || 'N/A';
    
    document.getElementById('pdf-to-name').textContent = invClientNameInput.value || 'Client Name';
    document.getElementById('pdf-to-addr').textContent = invClientAddrInput.value || 'Client Address';
    
    document.getElementById('pdf-meta-number').textContent = invNumberInput.value || 'N/A';
    
    // Date formatting (readable format)
    const rawDate = invDateInput.value;
    if (rawDate) {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        document.getElementById('pdf-meta-date').textContent = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        document.getElementById('pdf-meta-date').textContent = rawDate;
      }
    } else {
      document.getElementById('pdf-meta-date').textContent = 'N/A';
    }

    // Table rows rendering
    pdfTbody.innerHTML = '';
    let subtotal = 0;
    let totalTax = 0;

    lineItems.forEach(item => {
      const itemSubtotal = item.qty * item.rate;
      const itemTax = itemSubtotal * (item.gst / 100);
      const rowTotal = itemSubtotal;
      
      subtotal += itemSubtotal;
      totalTax += itemTax;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 500;">${escapeHtml(item.description) || '<i>Untitled Item</i>'}</td>
        <td class="align-right">${item.qty}</td>
        <td class="align-right">${formatRupeesWithoutSymbol(item.rate)}</td>
        <td class="align-right">${item.gst}%</td>
        <td class="align-right" style="font-weight: 600;">${formatRupeesWithoutSymbol(rowTotal)}</td>
      `;
      pdfTbody.appendChild(tr);
    });

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = subtotal + totalTax;

    // Totals Sync
    document.getElementById('pdf-calc-subtotal').textContent = formatRupees(subtotal);
    document.getElementById('pdf-calc-cgst').textContent = formatRupees(cgst);
    document.getElementById('pdf-calc-sgst').textContent = formatRupees(sgst);
    document.getElementById('pdf-calc-tax').textContent = formatRupees(totalTax);
    document.getElementById('pdf-calc-total').textContent = formatRupees(grandTotal);
  }

  // Format amount as currency string, but without prefixing currency symbol
  function formatRupeesWithoutSymbol(amount) {
    const formatted = formatRupees(amount);
    return formatted.replace(/[₹\s,]/g, '').replace(/(\d)(?=(\d\d)+\d$)/g, "$1,"); // basic commas injector helper
  }

  // HTML escaping utility to prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
