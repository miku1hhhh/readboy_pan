import {
  SIGN_API,
  buildSignature,
  validateDeviceParams,
  requireStr,
  ValidationError,
} from './_lib/sign';

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body = (await request.json()) as any;

    let params;
    try {
      params = validateDeviceParams(body);
    } catch (e: any) {
      if (e instanceof ValidationError) return e.toResponse();
      throw e;
    }

    const { token, uid, system, platform } = params;

    let fileName: string;
    try {
      fileName = requireStr(body, 'file_name', { maxLen: 256 });
    } catch (e: any) {
      if (e instanceof ValidationError) return e.toResponse();
      throw e;
    }

    const sig = buildSignature(token, uid, system, platform);
    const queryParams = new URLSearchParams({
      file_name: fileName,
      token: sig.token,
      device_id: sig.device_id,
      t: sig.t,
      sn: sig.sn,
    });

    const url = `${SIGN_API}?${queryParams.toString()}`;
    const resp = await fetch(url, {
      headers: { 'X-Secret-Key-Identifier': 'pad_sec' },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return Response.json(
        { error: `获取签名URL失败: HTTP ${resp.status}，${text.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const data = (await resp.json()) as any;
    if (data.errno !== 0) {
      const hint = data.errno === 7004 ? '（token 与 uid 不匹配？请重新登录）' : '';
      return Response.json(
        { error: `签名URL接口错误 [${data.errno}]: ${data.errmsg || '未知'}${hint}` },
        { status: 500 }
      );
    }

    const signUrl = String(data.data.sign_url).replace(/\\u0026/g, '&');
    const contentType = data.data.content_type || 'application/octet-stream';
    const permanentUrl = signUrl.split('?')[0];

    return Response.json({
      sign_url: signUrl,
      content_type: contentType,
      permanent_url: permanentUrl,
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || '异常' }, { status: 500 });
  }
};
