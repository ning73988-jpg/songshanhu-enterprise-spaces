const MAX_PHOTO_BYTES = 50 * 1024 * 1024;
const PHOTO_ORIGIN = 'https://img.denglai.xin';
const ADMIN_ORIGINS = new Set([
  'https://www.denglai.xin',
  'https://songshanhu-enterprise-spaces.pages.dev',
  'https://ning73988-jpg.github.io',
]);
const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

const hasBytes = (bytes, signature, offset = 0) =>
  signature.every((byte, index) => bytes[offset + index] === byte);

const formats = {
  'image/jpeg': { extension: 'jpg', matches: bytes => hasBytes(bytes, JPEG) },
  'image/png': { extension: 'png', matches: bytes => hasBytes(bytes, PNG) },
  'image/webp': { extension: 'webp', matches: bytes => hasBytes(bytes, RIFF) && hasBytes(bytes, WEBP, 8) },
};

export async function onRequest({ request, env }) {
  const origin = request.headers.get('Origin');
  const ownOrigin = new URL(request.url).origin;
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' });
  const reply = (status, data) => Response.json(data, { status, headers });

  if (origin && origin !== ownOrigin && !ADMIN_ORIGINS.has(origin)) {
    return reply(403, { message: '请从本站管理后台上传照片。' });
  }
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  if (request.method === 'OPTIONS') {
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    headers.set('Allow', 'POST, OPTIONS');
    return reply(405, { message: '请使用照片上传入口。' });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization || !/^Bearer [^\s]+$/i.test(authorization)) {
    return reply(401, { message: '请先登录管理后台。' });
  }

  const type = request.headers.get('Content-Type');
  const format = Object.hasOwn(formats, type) ? formats[type] : null;
  if (!format) return reply(415, { message: '房源照片请使用 JPG、PNG 或 WebP。' });

  const lengthHeader = request.headers.get('Content-Length');
  const length = Number(lengthHeader);
  if (!lengthHeader || !Number.isSafeInteger(length) || length <= 0) {
    return reply(400, { message: '照片文件为空或缺少文件大小，请重新选择。' });
  }
  if (length > MAX_PHOTO_BYTES) {
    return reply(413, { message: '单张照片超过 50 MB，请压缩后重试。' });
  }

  const backend = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const apikey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = env.LISTING_PHOTOS;
  if (!backend || !apikey || !bucket) {
    return reply(503, { message: '照片上传服务暂不可用，请稍后重试。' });
  }

  try {
    const authHeaders = { Authorization: authorization, apikey };
    const [userResponse, roleResponse] = await Promise.all([
      fetch(`${backend}/auth/v1/user`, { headers: authHeaders, signal: AbortSignal.timeout(8000) }),
      fetch(`${backend}/rest/v1/rpc/is_site_admin`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(8000),
      }),
    ]);
    if ([401, 403].includes(userResponse.status)) {
      return reply(401, { message: '管理员登录已失效，请重新登录。' });
    }
    if (!userResponse.ok || (roleResponse.status >= 500)) {
      return reply(503, { message: '管理员权限暂时无法核验，请稍后重试。' });
    }
    const user = await userResponse.json();
    if (typeof user?.id !== 'string' || !UUID.test(user.id) || !roleResponse.ok ||
        await roleResponse.json() !== true) {
      return reply(403, { message: '当前账号没有房源照片上传权限。' });
    }

    const bytes = new Uint8Array(await request.arrayBuffer());
    if (bytes.length !== length || !format.matches(bytes)) {
      return reply(415, { message: '照片内容和格式不一致，请重新导出图片。' });
    }
    const key = `uploads/${user.id}/${crypto.randomUUID()}.${format.extension}`;
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' },
    });
    return reply(201, { url: `${PHOTO_ORIGIN}/${key}` });
  } catch {
    return reply(503, { message: '照片上传暂未完成，请稍后重试。' });
  }
}
