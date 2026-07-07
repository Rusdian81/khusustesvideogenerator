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
    // Strip dashes from both stored keys and submitted key before comparing
    // so OMNI-XG9J-3MN6-HQCC matches OMNIXG9J3MN6HQCC and vice versa
    const validKeys = rawKeys.split(',').map(k => k.trim().replace(/-/g,'').toUpperCase()).filter(Boolean);
    const isValid = validKeys.includes(key.trim().replace(/-/g,'').toUpperCase());

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
