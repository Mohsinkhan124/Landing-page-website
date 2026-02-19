window.addEventListener('load', function() {
  
  const skillBars = document.querySelectorAll('.skill-bar');
  
  setTimeout(function() {
    skillBars.forEach(function(bar) {
      const percent = bar.getAttribute('data-percent');
      bar.style.width = percent + '%';
    });
  }, 300);

  const toggleExp = document.getElementById('toggle-experience');
  const expContent = document.getElementById('experience-content');

  if (toggleExp && expContent) {
    toggleExp.addEventListener('click', function () {
      if (expContent.style.display === 'none') {
        expContent.style.display = 'block';
        toggleExp.innerHTML = '<i class="fa-solid fa-circle-down"></i>';
        toggleExp.setAttribute('aria-expanded', 'true');
      } else {
        expContent.style.display = 'none';
        toggleExp.innerHTML = '<i class="fa-solid fa-circle-up"></i>';
        toggleExp.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const toggleEdu = document.getElementById('toggle-education');
  const eduContent = document.getElementById('education-content');

  if (toggleEdu && eduContent) {
    toggleEdu.addEventListener('click', function () {
      if (eduContent.style.display === 'none') {
        eduContent.style.display = 'block';
        toggleEdu.innerHTML = '<i class="fa-solid fa-circle-down"></i>';
        toggleEdu.setAttribute('aria-expanded', 'true');
      } else {
        eduContent.style.display = 'none';
        toggleEdu.innerHTML = '<i class="fa-solid fa-circle-up"></i>';
        toggleEdu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const downloadBtn = document.getElementById('download-pdf');

  if (downloadBtn) {
  downloadBtn.addEventListener('click', function () {
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    this.disabled = true;

    const element = document.createElement('div');
    element.id = 'pdf-content';

    const headerClone = document.querySelector('header').cloneNode(true);
    const mainClone = document.querySelector('.resume-container').cloneNode(true);
    const footerClone = document.querySelector('footer').cloneNode(true);

    mainClone.querySelectorAll('.toggle-btn').forEach(btn => btn.remove());
    const downloadBtnClone = mainClone.querySelector('#download-pdf');
    if (downloadBtnClone) downloadBtnClone.remove();

    mainClone.querySelectorAll('#experience-content, #education-content').forEach(el => {
      el.style.display = 'block';
    });

    mainClone.querySelectorAll('.skill-bar').forEach(bar => {
      const percent = bar.getAttribute('data-percent');
      bar.style.width = percent + '%';
    });

    element.appendChild(headerClone);
    element.appendChild(mainClone);
    element.appendChild(footerClone);

    // Inject your full CSS into the PDF element
    const style = document.createElement('style');
    fetch('style.css')
      .then(response => response.text())
      .then(css => {
        style.innerHTML = css;
        element.prepend(style);

        const opt = {
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: 'Mohsin_Khan_Resume.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
        }).catch(err => {
          console.error('PDF generation error:', err);
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
          alert('PDF generation failed. Please try again.');
        });
      });
  });
}

});