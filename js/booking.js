/**
 * Beauty & Style - Booking Wizard JavaScript
 */

document.addEventListener('DOMContentLoaded', initBookingWizard);

function initBookingWizard() {
  const panels = ['panel-1', 'panel-2', 'panel-3', 'panel-4'];
  let currentStep = 1;

  // Booking state
  const booking = {
    service: null,
    servicePrice: null,
    serviceDuration: null,
    stylist: null,
    date: null,
    time: null,
  };

  // Set min date
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date();
    dateInput.min = today.toISOString().split('T')[0];
  }

  // ===================== STEP 1: Service Selection =====================
  document.querySelectorAll('.service-select-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.service-select-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      booking.service = card.dataset.service;
      booking.servicePrice = card.dataset.price;
      booking.serviceDuration = card.dataset.duration;

      updateSummary();

      const nextBtn = document.getElementById('step1-next');
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  document.getElementById('step1-next')?.addEventListener('click', () => goToStep(2));

  // ===================== STEP 2: Stylist & Time =====================
  document.querySelectorAll('.stylist-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      booking.stylist = card.dataset.stylist;
      updateSummary();
      checkStep2Valid();
    });
  });

  document.querySelectorAll('.time-slot:not(.unavailable)').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      booking.time = slot.dataset.time;
      updateSummary();
      checkStep2Valid();
    });
  });

  dateInput?.addEventListener('change', () => {
    booking.date = dateInput.value;
    if (booking.date) {
      const d = new Date(booking.date + 'T00:00:00');
      const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      booking.dateFormatted = d.toLocaleDateString('en-US', opts);
    }
    updateSummary();
    checkStep2Valid();
  });

  function checkStep2Valid() {
    const btn = document.getElementById('step2-next');
    if (btn) btn.disabled = !(booking.stylist && booking.time && booking.date);
  }

  document.getElementById('step2-back')?.addEventListener('click', () => goToStep(1));
  document.getElementById('step2-next')?.addEventListener('click', () => goToStep(3));

  // ===================== STEP 3: Personal Details =====================
  document.getElementById('step3-back')?.addEventListener('click', () => goToStep(2));

  document.getElementById('booking-final-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('b-firstname').value.trim();
    const lastName = document.getElementById('b-lastname').value.trim();
    const email = document.getElementById('b-email').value.trim();
    const phone = document.getElementById('b-phone').value.trim();
    const terms = document.getElementById('b-terms').checked;

    if (!firstName || !lastName) { showBookingError('Please enter your full name.'); return; }
    if (!email || !isValidEmail(email)) { showBookingError('Please enter a valid email address.'); return; }
    if (!phone) { showBookingError('Please enter your phone number.'); return; }
    if (!terms) { showBookingError('Please agree to the Terms & Conditions.'); return; }

    // Show confirmation
    const confirmDetails = document.getElementById('confirm-details');
    if (confirmDetails) {
      confirmDetails.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; font-size:.88rem; padding:6px 0; border-bottom:1px solid var(--gray-200);">
            <span style="color:var(--gray-500)">Name</span>
            <span style="font-weight:600">${firstName} ${lastName}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:.88rem; padding:6px 0; border-bottom:1px solid var(--gray-200);">
            <span style="color:var(--gray-500)">Service</span>
            <span style="font-weight:600">${booking.service}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:.88rem; padding:6px 0; border-bottom:1px solid var(--gray-200);">
            <span style="color:var(--gray-500)">Stylist</span>
            <span style="font-weight:600">${booking.stylist || 'Any Available'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:.88rem; padding:6px 0; border-bottom:1px solid var(--gray-200);">
            <span style="color:var(--gray-500)">Date</span>
            <span style="font-weight:600">${booking.dateFormatted || booking.date}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:.88rem; padding:6px 0;">
            <span style="color:var(--gray-500)">Time</span>
            <span style="font-weight:600">${booking.time}</span>
          </div>
        </div>
      `;
    }

    goToStep(4);
  });

  // ===================== Navigation =====================
  function goToStep(step) {
    // Hide all panels
    panels.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    // Show target panel
    const target = document.getElementById(`panel-${step}`);
    if (target) target.classList.add('active');

    // Update step indicators
    for (let i = 1; i <= 3; i++) {
      const ind = document.getElementById(`step-ind-${i}`);
      if (!ind) continue;
      ind.classList.remove('active', 'done');
      if (i < step) ind.classList.add('done');
      else if (i === step) ind.classList.add('active');
    }

    currentStep = step;

    // Scroll to top of form area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===================== Summary Update =====================
  function updateSummary() {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('sum-service', booking.service || 'Not selected');
    setText('sum-stylist', booking.stylist || '—');
    setText('sum-date', booking.dateFormatted || booking.date || '—');
    setText('sum-time', booking.time || '—');
    setText('sum-duration', booking.serviceDuration || '—');
    setText('sum-price', booking.servicePrice ? `€${booking.servicePrice}` : '€—');
  }

  // ===================== Helpers =====================
  function showBookingError(msg) {
    if (window.BS) {
      window.BS.showToast(msg, 'error');
    } else {
      alert(msg);
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
