(function () {
  const carousel = document.querySelector('.profile-carousel');
  const track = carousel && carousel.querySelector('.profile-carousel-track');
  const profileRoot = document.querySelector('[data-characteristics-root]');
  const profileSlug = (carousel && carousel.dataset.profileSlug) || (profileRoot && profileRoot.dataset.profileSlug);

  if (!carousel || !track || !profileSlug) return;

  function photoUrl(photo) {
    if (photo.public_url) return photo.public_url;
    if (window.loveSupabase && photo.storage_path) {
      return window.loveSupabase.getPublicUrl(photo.storage_path);
    }
    return photo.storage_path || '';
  }

  function renderPhotos(photos) {
    const slides = photos
      .map((photo, index) => {
        const src = photoUrl(photo);
        if (!src) return '';
        return `
          <div class="profile-slide">
            <img src="${src}" alt="Foto ${index + 1} do perfil">
          </div>
        `;
      })
      .join('');

    if (slides.trim()) {
      track.innerHTML = slides;
    }
  }

  async function loadProfilePhotos() {
    if (!window.loveSupabase || !window.loveSupabase.isReady()) return;

    try {
      const { data, error } = await window.loveSupabase.client
        .from('profile_photos')
        .select('storage_path, public_url, display_order')
        .eq('profile_slug', profileSlug)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (data && data.length) renderPhotos(data);
    } catch (error) {
      console.warn('Supabase indisponivel para fotos do perfil, usando HTML.', error);
    }
  }

  loadProfilePhotos();
})();
