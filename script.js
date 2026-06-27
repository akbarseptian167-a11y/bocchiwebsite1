document.addEventListener('DOMContentLoaded', () => {

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  const phrases = [
    'Membangun antarmuka web yang bersih.',
    'Merancang pengalaman pengguna yang optimal.',
    'Mempelajari hal baru setiap hari.',
    'Terbuka untuk kolaborasi proyek freelance.'
  ];
  
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingElement = document.getElementById('typingText');

  function triggerTyping() {
    if (!typingElement) return;
    const currentString = phrases[phraseIndex];

    if (!isDeleting && charIndex < currentString.length) {
      charIndex++;
      setTimeout(triggerTyping, 60);
    } 
    else if (!isDeleting && charIndex === currentString.length) {
      setTimeout(() => {
        isDeleting = true;
        triggerTyping();
      }, 2000);
      return;
    } 
    else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(triggerTyping, 35);
    } 
    else {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(triggerTyping, 200);
      return;
    }

    typingElement.textContent = currentString.slice(0, charIndex);
  }

  triggerTyping();

  const progressBar = document.getElementById('progress');
  let ticking = false;

  if (progressBar) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winScroll = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          
          if (scrollHeight > 0) {
            const percentage = (winScroll / scrollHeight) * 100;
            progressBar.style.width = percentage + '%';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  const tombolAudio = document.getElementById('tombolAudioAnime');
  const audioProjek = document.getElementById('audioProjek');

  if (tombolAudio && audioProjek) {
    tombolAudio.addEventListener('click', () => {
      audioProjek.currentTime = 0; 
      audioProjek.play().catch(error => {
        console.log(error);
      });
    });
  }

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const currentTheme = localStorage.getItem('theme');

  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggleBtn.textContent = 'Mode Terang';
  } else {
    themeToggleBtn.textContent = 'Mode Gelap';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      
      let theme = 'light';
      if (document.body.classList.contains('dark-theme')) {
        theme = 'dark';
        themeToggleBtn.textContent = 'Mode Terang';
      } else {
        themeToggleBtn.textContent = 'Mode Gelap';
      }
      localStorage.setItem('theme', theme);
    });
  }

  const bocchiMascot = document.getElementById('bocchiMascot');
  const audioBocchiAngkat = document.getElementById('audioBocchiAngkat');

  if (bocchiMascot && audioBocchiAngkat) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const startDrag = (e) => {
      isDragging = true;
      
      bocchiMascot.style.animation = 'none'; 
      
      bocchiMascot.classList.remove('falling');
      bocchiMascot.classList.add('lifted');
      
      audioBocchiAngkat.currentTime = 0;
      audioBocchiAngkat.play().catch(() => {});

      const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

      const rect = bocchiMascot.getBoundingClientRect();
      
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;

      if (e.cancelable) e.preventDefault();
    };

    const doDrag = (e) => {
      if (!isDragging) return;

      const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

      let newLeft = clientX - offsetX;
      let newTop = clientY - offsetY;

      const maxLeft = window.innerWidth - bocchiMascot.offsetWidth;
      const maxTop = window.innerHeight - bocchiMascot.offsetHeight;

      if (newLeft < 0) newLeft = 0;
      if (newLeft > maxLeft) newLeft = maxLeft;
      if (newTop < 0) newTop = 0;
      if (newTop > maxTop) newTop = maxTop;

      bocchiMascot.style.left = `${newLeft}px`;
      bocchiMascot.style.top = `${newTop}px`;
      bocchiMascot.style.bottom = 'auto';
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      
      bocchiMascot.classList.remove('lifted');
      bocchiMascot.classList.add('falling');

      bocchiMascot.style.top = `calc(100vh - ${bocchiMascot.offsetHeight + 12}px)`;

      setTimeout(() => {
        if (!isDragging) {
          bocchiMascot.style.top = 'auto';
          bocchiMascot.style.bottom = '12px';
          bocchiMascot.classList.remove('falling');
          
          bocchiMascot.style.animation = 'bocchiPatrol 20s linear infinite';
        }
      }, 500);
    };

    bocchiMascot.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', endDrag);

    bocchiMascot.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', doDrag, { passive: false });
    window.addEventListener('touchend', endDrag);
  }
});