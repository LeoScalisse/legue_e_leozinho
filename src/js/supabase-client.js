(function () {
  const config = window.SUPABASE_CONFIG || {};
  const hasConfig = Boolean(config.url && config.anonKey);
  const hasSdk = Boolean(window.supabase && window.supabase.createClient);
  const client = hasConfig && hasSdk
    ? window.supabase.createClient(config.url, config.anonKey)
    : null;
  const storageBucket = config.storageBucket || 'love-photos';
  const edgeBaseUrl = config.edgeBaseUrl || (config.url ? `${config.url}/functions/v1` : '');

  function isReady() {
    return Boolean(client);
  }

  function getPublicUrl(path) {
    if (!client || !path) return '';
    const result = client.storage.from(storageBucket).getPublicUrl(path);
    return result.data.publicUrl;
  }

  function edgeFunctionUrl(name) {
    if (!edgeBaseUrl || !name) return '';
    return `${edgeBaseUrl.replace(/\/$/, '')}/${name}`;
  }

  async function uploadImage(folder, file) {
    if (!client || !file) return null;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const { error } = await client.storage.from(storageBucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) throw error;

    return {
      storage_path: path,
      public_url: getPublicUrl(path)
    };
  }

  window.loveSupabase = {
    client,
    storageBucket,
    isReady,
    getPublicUrl,
    edgeFunctionUrl,
    uploadImage
  };
})();
