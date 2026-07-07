export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ valid: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { key } = await req.json();

    if (!key || typeof key !== 'string') {
      return new Response(JSON.stringify({ valid: false, error: 'License key tidak valid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // License keys disimpan di Vercel Environment Variable bernama LICENSE_KEYS
    // Format: key1,key2,key3 (dipisah koma)
    const rawKeys = process.env.LICENSE_KEYS || '';
    const validKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

    const isValid = validKeys.includes(key.trim().toUpperCase());

    // Rate limit sederhana via response — tidak log key yang dicoba
    return new Response(JSON.stringify({ valid: isValid }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
