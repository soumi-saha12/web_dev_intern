const galleryItems = document.querySelectorAll('.gallery-item img');

galleryItems.forEach(img => {
  if (img.complete) {
    img.closest('.gallery-item').classList.add('loaded');
  } else {
    img.addEventListener('load', () => {
      img.closest('.gallery-item').classList.add('loaded');
    });
  }
});

const lightbox = document.getElementById('lightbox');
const lbBgGrid = document.getElementById('lbBgGrid');
const lbImg = document.getElementById('lbImg');
const lbLabel = document.getElementById('lbLabel');
const lbCounter = document.getElementById('lbCounter');
const lbStrip = document.getElementById('lbStrip');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

let current = 0;

const imageData = Array.from(galleryItems).map(img => ({
  src: img.src,
  alt: img.alt || 'Gallery image',
  label: img.closest('.gallery-item').querySelector('.item-label')?.textContent || ''
}));

// Build background grid cells
imageData.forEach(data => {
  const cell = document.createElement('div');
  cell.className = 'lb-bg-cell';
  cell.style.backgroundImage = `url(${data.src})`;
  lbBgGrid.appendChild(cell);
});

// Build bottom strip thumbnails
imageData.forEach((data, i) => {
  const thumb = document.createElement('div');
  thumb.className = 'strip-thumb';
  thumb.style.backgroundImage = `url(${data.src})`;
  thumb.onclick = () => goTo(i);
  lbStrip.appendChild(thumb);
});

function openLightbox(i) {
  current = i;
  lightbox.classList.add('open');
  document.body.classList.add('lb-open');
  render();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.classList.remove('lb-open');
}

function goTo(i) {
  current = (i + imageData.length) % imageData.length;
  render();
}

function render() {
  const data = imageData[current];
  lbImg.src = data.src;
  lbImg.alt = data.alt;
  lbLabel.textContent = data.label;
  lbCounter.textContent = (current + 1) + ' / ' + imageData.length;

  document.querySelectorAll('.lb-bg-cell').forEach((el, i) => {
    el.classList.toggle('is-active', i === current);
  });

  document.querySelectorAll('.strip-thumb').forEach((el, i) => {
    el.classList.toggle('active-strip', i === current);
  });
}

galleryItems.forEach((img, i) => {
  img.closest('.gallery-item').addEventListener('click', () => openLightbox(i));
});

lbClose.onclick = closeLightbox;
lbPrev.onclick = () => goTo(current - 1);
lbNext.onclick = () => goTo(current + 1);

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === 'ArrowLeft') goTo(current - 1);
  if (e.key === 'Escape') closeLightbox();
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) < 50) return; // ignore accidental taps
  if (diff > 0) goTo(current + 1); // swipe left = next
  if (diff < 0) goTo(current - 1); // swipe right = prev
});

const filterBtns = document.querySelectorAll('.filter-btn');
const allItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {

    // update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    allItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

  });
});

// Favourites logic
let favourites = JSON.parse(localStorage.getItem('gallery-favs') || '[]');

const favBtns = document.querySelectorAll('.fav-btn');

function saveFavs() {
  localStorage.setItem('gallery-favs', JSON.stringify(favourites));
}

function applyFavStates() {
  favBtns.forEach(btn => {
    if (favourites.includes(btn.dataset.id)) {
      btn.classList.add('faved');
      btn.textContent = '♥';
    } else {
      btn.classList.remove('faved');
      btn.textContent = '♡';
    }
  });
}

favBtns.forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation(); // prevent lightbox from opening
    const id = btn.dataset.id;
    if (favourites.includes(id)) {
      favourites = favourites.filter(f => f !== id);
    } else {
      favourites.push(id);
    }
    saveFavs();
    applyFavStates();

    // re-apply if favourites filter is active
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter && activeFilter.dataset.filter === 'favourites') {
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.toggle('hidden', !favourites.includes(item.querySelector('.fav-btn').dataset.id));
      });
    }
  });
});

// Hook favourites into filter bar
document.querySelector('[data-filter="favourites"]')
  ?.addEventListener('click', () => {
    document.querySelectorAll('.gallery-item').forEach(item => {
      const id = item.querySelector('.fav-btn').dataset.id;
      item.classList.toggle('hidden', !favourites.includes(id));
    });
  });

// Init on page load
applyFavStates();
