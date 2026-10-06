interface Env {
  KV: KVNamespace;
}

const CONFIG_KEY = 'app_config';

const DEFAULT_CONFIG = {
  token: 'null',
  uid: 'null',
  system: 'windows',
  platform: 'desktop',
  mode: 'file',
  speedTestSize: '1024',
  speedTestRounds: '3',
  speedTestWarmup: '1',
  concurrency: '3',
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const cfg = await env.KV.get(CONFIG_KEY, 'json');
  return Response.json(cfg || DEFAULT_CONFIG);
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = (await request.json()) as any;

  const cleaned: Record<string, string> = { ...DEFAULT_CONFIG };
  for (const k of Object.keys(DEFAULT_CONFIG)) {
    if (body[k] !== undefined) cleaned[k] = String(body[k]);
  }

  // 校验（对齐 app.py 的行为）
  const warnings: string[] = [];
  const validSystems = ['windows', 'macos', 'android', 'ios', 'linux'];
  const validPlatforms = ['desktop', 'mobile'];

  if (!validSystems.includes(cleaned.system)) {
    warnings.push(`system '${cleaned.system}' 不在白名单，已重置为 windows`);
    cleaned.system = 'windows';
  }
  if (!validPlatforms.includes(cleaned.platform)) {
    warnings.push(`platform '${cleaned.platform}' 不在白名单，已重置为 desktop`);
    cleaned.platform = 'desktop';
  }
  if (!['file', 'log'].includes(cleaned.mode)) {
    cleaned.mode = 'file';
  }

  await env.KV.put(CONFIG_KEY, JSON.stringify(cleaned));

  const resp: any = { status: 'ok' };
  if (warnings.length) resp.warnings = warnings;
  return Response.json(resp);
};
