/**
 * Hugging Face Data Loader for SAGE Leaderboard
 */

const HF_CONFIG = {
    // Hugging Face Repository Config
    repo: 'intellistream/sagellm-benchmark-results', // Placeholder until real repo is ready
    branch: 'main',

    // Data files in HF repo
    files: {
        single: 'leaderboard_single.json',
        multi: 'leaderboard_multi.json'
    },

    // Fallback to local
    fallbackToLocal: true,
    localPath: 'data/' // Relative to the page serving it
};

/**
 * Load JSON from Hugging Face Hub
 */
async function loadFromHuggingFace(filename) {
    const url = `https://huggingface.co/datasets/${HF_CONFIG.repo}/resolve/${HF_CONFIG.branch}/${filename}`;
    console.log(`[HF Loader] Fetching: ${url}`);

    const response = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-cache' });

    if (!response.ok) {
        throw new Error(`HF API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Load JSON from local fallback
 */
async function loadFromLocal(filename) {
    const url = `${HF_CONFIG.localPath}${filename}`;
    console.log(`[HF Loader] Fallback to local: ${url}`);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Local file error: ${response.status}`);
    return await response.json();
}

/**
 * Main Loader function
 */
async function loadLeaderboardData() {
    const result = { single: [], multi: [] };

    try {
        console.log('[HF Loader] Loading from Hugging Face...');
        const [singleData, multiData] = await Promise.all([
            loadFromHuggingFace(HF_CONFIG.files.single),
            loadFromHuggingFace(HF_CONFIG.files.multi)
        ]);

        result.single = singleData;
        result.multi = multiData;
        console.log(`[HF Loader] ✅ Loaded from HF: ${result.single.length} single, ${result.multi.length} multi`);
        return result;

    } catch (hfError) {
        console.warn('[HF Loader] ⚠️ HF load failed:', hfError.message);

        if (HF_CONFIG.fallbackToLocal) {
            try {
                console.log('[HF Loader] Trying local fallback...');
                const [singleData, multiData] = await Promise.all([
                    loadFromLocal(HF_CONFIG.files.single),
                    loadFromLocal(HF_CONFIG.files.multi)
                ]);

                result.single = singleData;
                result.multi = multiData;
                console.log(`[HF Loader] ✅ Loaded from local: ${result.single.length} single, ${result.multi.length} multi`);
                return result;
            } catch (localError) {
                console.error('[HF Loader] ❌ Local fallback also failed:', localError.message);
                throw new Error('Failed to load data from both HF and local');
            }
        }
        throw hfError;
    }
}

// Export
window.HFDataLoader = {
    loadLeaderboardData,
    config: HF_CONFIG
};
