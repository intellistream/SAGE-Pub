// Runtime configuration - 安全版本
window.SAGE_RUNTIME_CONFIG = window.SAGE_RUNTIME_CONFIG || {};

// 不直接存储 Token，而是提供配置方法
window.SAGE_RUNTIME_CONFIG.setGistToken = function(token) {
  this.gistToken = token;
  console.log('🔑 Gist Token 已设置');
};

// 生产环境标识
window.SAGE_RUNTIME_CONFIG.environment = 'production';
window.SAGE_RUNTIME_CONFIG.buildTime = new Date().toISOString();

console.log('🚀 生产环境配置已加载');
