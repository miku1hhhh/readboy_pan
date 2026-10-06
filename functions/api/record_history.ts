interface Env {
  DB: D1Database;
}

const MAX_HISTORY_ROWS = 500;

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = (await request.json()) as any;
    const fileName = String(body.file_name || '').trim();
    const remoteUrl = String(body.remote_url || '').trim();
    const fileSize = parseInt(body.file_size, 10) || 0;
    const mode = String(body.mode || 'sign_upload').slice(0, 32);

    if (!fileName || !remoteUrl) {
      return Response.json({ error: '缺少文件名或 URL' }, { status: 400 });
    }

    const id = crypto.randomUUID().replace(/-/g, '');
    const uploadTime = new Date().toISOString();

    // 去重：相同 URL 先删
    await env.DB.prepare('DELETE FROM history WHERE remote_url = ?')
      .bind(remoteUrl)
      .run();

    // 插入新记录
    await env.DB.prepare(
      'INSERT INTO history (id, file_name, remote_url, upload_time, mode, file_size) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(id, fileName, remoteUrl, uploadTime, mode, fileSize)
      .run();

    // 限制条数
    await env.DB.prepare(
      `DELETE FROM history WHERE id NOT IN (
        SELECT id FROM history ORDER BY upload_time DESC LIMIT ?
      )`
    )
      .bind(MAX_HISTORY_ROWS)
      .run();

    return Response.json({ success: true, id });
  } catch (e: any) {
    return Response.json({ error: e?.message || '异常' }, { status: 500 });
  }
};
