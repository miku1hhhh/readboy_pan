export const onRequestGet: PagesFunction = async () => {
  return Response.json({
    // 支持的功能
    sign_direct: true,
    speedtest: true,
    login: true,
    history: true,
    config: true,
    // 不支持（Workers 环境无法做后端转发大文件）
    upload: false,
    sign_upload: false,
    url_upload: false,
    speedtest_e2e: false,
    log_mode: false,
  });
};
