/**
 * SAGE Leaderboard Data Loader
 * 
 * 从 Hugging Face Datasets Hub 或本地加载 benchmark 结果
 * 支持实时更新，无需后端服务
 * 
 * 适配自 sagellm-website，用于 SAGE-Pub 主题
 */

const HF_CONFIG = {
    // Hugging Face 仓库配置
    repo: 'wangyao36/sagellm-benchmark-results',
    branch: 'main',

    // 数据文件路径（在 HF repo 中的路径）
    files: {
        single: 'leaderboard_single.json',
        multi: 'leaderboard_multi.json',
        distributed: 'leaderboard_distributed.json'
    },

    // 备用：本地数据（当 HF 不可用时）
    fallbackToLocal: true,
    localPath: './data/'
};

/**
 * 从 Hugging Face Hub 加载 JSON 文件
 * @param {string} filename - 文件名
 * @returns {Promise<Array>} - 解析后的 JSON 数据
 */
async function loadFromHuggingFace(filename) {
    // Hugging Face raw file URL 格式
    // https://huggingface.co/datasets/{repo}/resolve/{branch}/{path}
    const url = `https://huggingface.co/datasets/${HF_CONFIG.repo}/resolve/${HF_CONFIG.branch}/${filename}`;

    console.log(`[SAGE HF Loader] Fetching: ${url}`);

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json'
        },
        cache: 'no-cache'  // 确保获取最新数据
    });

    if (!response.ok) {
        throw new Error(`HF API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

/**
 * 从本地加载 JSON 文件（备用）
 * @param {string} filename - 文件名
 * @returns {Promise<Array>} - 解析后的 JSON 数据
 */
async function loadFromLocal(filename) {
    const url = `${HF_CONFIG.localPath}${filename}`;
    console.log(`[SAGE HF Loader] Fallback to local: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Local file error: ${response.status}`);
    }
    return await response.json();
}

/**
 * 加载 leaderboard 数据（优先 HF，失败则本地）
 * @returns {Promise<{single: Array, multi: Array}>}
 */
async function loadLeaderboardData() {
    const result = { single: [], multi: [] };

    // 尝试从 Hugging Face 加载
    try {
        console.log('[SAGE HF Loader] Loading from Hugging Face...');

        const [singleData, multiData, distributedData] = await Promise.all([
            loadFromHuggingFace(HF_CONFIG.files.single),
            loadFromHuggingFace(HF_CONFIG.files.multi),
            loadFromHuggingFace(HF_CONFIG.files.distributed)
        ]);

        result.single = singleData;
        // 合并 multi 和 distributed 数据，JS 会根据 cluster.node_count 区分
        result.multi = [...multiData, ...distributedData];

        console.log(`[SAGE HF Loader] ✅ Loaded from HF: ${result.single.length} single, ${multiData.length} multi, ${distributedData.length} distributed`);
        return result;

    } catch (hfError) {
        console.warn('[SAGE HF Loader] ⚠️ HF load failed:', hfError.message);

        // 如果配置允许，尝试本地备用
        if (HF_CONFIG.fallbackToLocal) {
            try {
                console.log('[SAGE HF Loader] Trying local fallback...');

                const [singleData, multiData, distributedData] = await Promise.all([
                    loadFromLocal(HF_CONFIG.files.single),
                    loadFromLocal(HF_CONFIG.files.multi),
                    loadFromLocal(HF_CONFIG.files.distributed)
                ]);

                result.single = singleData;
                // 合并 multi 和 distributed 数据
                result.multi = [...multiData, ...distributedData];

                console.log(`[SAGE HF Loader] ✅ Loaded from local: ${result.single.length} single, ${multiData.length} multi, ${distributedData.length} distributed`);
                return result;

            } catch (localError) {
                console.error('[SAGE HF Loader] ❌ Local fallback also failed:', localError.message);
                throw new Error('Failed to load data from both HF and local');
            }
        }

        throw hfError;
    }
}

/**
 * 获取数据的最后更新时间（从 HF API）
 * @returns {Promise<string|null>}
 */
async function getLastUpdated() {
    try {
        // HF Datasets API 获取 repo 信息
        const url = `https://huggingface.co/api/datasets/${HF_CONFIG.repo}`;
        const response = await fetch(url);

        if (response.ok) {
            const info = await response.json();
            return info.lastModified || null;
        }
    } catch (e) {
        console.warn('[SAGE HF Loader] Could not get last updated time');
    }
    return null;
}

// 导出供 leaderboard.js 使用
window.HFDataLoader = {
    loadLeaderboardData,
    getLastUpdated,
    config: HF_CONFIG
};
