// Theme toggle and small helpers
(function(){
  const html = document.documentElement;
  const key = 'usable-theme';
  const saved = localStorage.getItem(key);
  if(saved){ html.classList.toggle('light', saved === 'light'); html.classList.toggle('dark', saved === 'dark'); }
  else {
    html.classList.add(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  const toggleBtn = document.querySelector('.theme-toggle');
  toggleBtn && toggleBtn.addEventListener('click', () => {
    const isDark = html.classList.contains('dark');
    html.classList.toggle('dark', !isDark);
    html.classList.toggle('light', isDark);
    localStorage.setItem(key, isDark ? 'light' : 'dark');
  });

  // year
  const y = document.getElementById('year'); if(y) y.textContent = String(new Date().getFullYear());
})();

// Waitlist demo handler
window.usableSubmit = function(e){
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  console.log('Waitlist request', data);
  form.reset();
  alert('Thanks! We will reach out shortly.');
  return false;
}


