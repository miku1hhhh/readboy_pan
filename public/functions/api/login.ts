import { LOGIN_API } from './_lib/sign';

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body = (await request.json()) as any;
    const userAccount = String(body.userAccount || '').trim();
    const password = String(body.password || '').trim();
    const userType = body.userType ?? 1;

    if (!userAccount || !password) {
      return Response.json({ error: '缺少账号或密码' }, { status: 400 });
    }

    const formData = new URLSearchParams();
    formData.append('userAccount', userAccount);
    formData.append('password', password);
    formData.append('userType', String(userType));

    const resp = await fetch(LOGIN_API, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        origin: 'https://english-listening-speaking.readboy.com',
        referer: 'https://english-listening-speaking.readboy.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData.toString(),
    });

    if (!resp.ok) {
      return Response.json(
        { error: `登录请求失败: HTTP ${resp.status}` },
        { status: 500 }
      );
    }

    const data = (await resp.json()) as any;
    if (data.F_responseNo !== 10000) {
      return Response.json(
        { error: data.F_responseMsg || '登录失败' },
        { status: 401 }
      );
    }

    const user = data.F_data || {};
    if (!user.sessionId || !user.userId) {
      return Response.json(
        { error: '登录响应缺少 token 或 uid' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      token: user.sessionId,
      uid: user.userId,
      userName: user.userName,
      userClassId: user.userClassId,
      schoolId: user.userSchoolId,
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || '登录异常' }, { status: 500 });
  }
};
