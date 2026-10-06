import { md5Hex } from './md5';

export const APPID = 'english-listening-speaking.readboy.com';
export const APPSECRET = 'e03b609d29b725ba12fa6c7d9843abfd';
export const SIGN_API = 'https://listen-speak.readboy.com/api/v1/file_sign_url';
export const LOGIN_API = 'https://listen-speak.readboy.com/api/account/login';

export const VALID_SYSTEMS = new Set(['windows', 'macos', 'android', 'ios', 'linux']);
export const VALID_PLATFORMS = new Set(['desktop', 'mobile']);
export const VALID_MODES = new Set(['file', 'log']);

export class ValidationError extends Error {
  field: string | null;
  constructor(message: string, field: string | null = null) {
    super(message);
    this.field = field;
  }
  toResponse() {
    const payload: any = { error: this.message };
    if (this.field) payload.field = this.field;
    return Response.json(payload, { status: 400 });
  }
}

export interface Signature {
  token: string;
  device_id: string;
  t: string;
  sn: string;
}

export function buildSignature(
  token: string,
  uid: string,
  system: string,
  platform: string
): Signature {
  const t = Math.floor(Date.now() / 1000).toString();
  const deviceRaw = `1/${system}/${platform}/${APPID}/1/${uid}`;
  const deviceId = encodeURI(deviceRaw);
  const sn = md5Hex(deviceId + APPSECRET + t);
  return { token, device_id: deviceId, t, sn };
}

export function requireStr(
  data: any,
  field: string,
  opts: {
    maxLen?: number;
    choices?: Set<string>;
    default?: string;
  } = {}
): string {
  const { maxLen = 512, choices, default: def } = opts;
  let val = data?.[field];

  if (val === undefined || val === null || val === '') {
    if (def !== undefined) return def;
    throw new ValidationError(`缺少参数: ${field}`, field);
  }

  val = String(val).trim();
  if (!val) {
    if (def !== undefined) return def;
    throw new ValidationError(`参数为空: ${field}`, field);
  }

  if (val.length > maxLen) {
    throw new ValidationError(`参数过长: ${field}（最多 ${maxLen} 字符）`, field);
  }

  if (choices && !choices.has(val)) {
    throw new ValidationError(
      `参数 ${field} 非法: '${val}'，允许值: ${[...choices].join(', ')}`,
      field
    );
  }

  return val;
}

export function validateDeviceParams(data: any) {
  const token = requireStr(data, 'token', { maxLen: 512 });
  const uid = requireStr(data, 'uid', { maxLen: 128 });
  const system = requireStr(data, 'system', {
    maxLen: 32,
    choices: VALID_SYSTEMS,
    default: 'windows',
  });
  const platform = requireStr(data, 'platform', {
    maxLen: 32,
    choices: VALID_PLATFORMS,
    default: 'desktop',
  });
  return { token, uid, system, platform };
}
