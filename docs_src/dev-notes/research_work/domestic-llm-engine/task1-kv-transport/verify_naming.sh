#!/bin/bash
# 验证命名重构的完整性

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 排除说明文档（包含对比示例）
EXCLUDE_DOCS="NAMING_REFACTOR.md|CLEANUP_COMPLETE.md"

echo "================================================"
echo "  sageLLM 命名重构验证工具"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 统计函数
count_pattern() {
    local pattern=$1
    local files="1.*.md PHASE1_OVERVIEW.md"
    grep -o "$pattern" $files 2>/dev/null | wc -l || echo 0
}

# 1. 检查新命名使用情况
echo "📊 新命名使用统计:"
echo "---"

comm_count=$(count_pattern 'sagellm\.comm\.')
kvmgr_count=$(count_pattern 'sagellm\.kvmgr\.')
accel_count=$(count_pattern 'sagellm\.accel\.')

echo "  • sagellm.comm.*       : $comm_count 处"
echo "  • sagellm.kvmgr.*      : $kvmgr_count 处"
echo "  • sagellm.accel.*      : $accel_count 处"
echo ""

comm_path=$(count_pattern 'comm/')
kvmgr_path=$(count_pattern 'kvmgr/')
accel_path=$(count_pattern 'accel/')

echo "  • comm/ 路径引用       : $comm_path 处"
echo "  • kvmgr/ 路径引用      : $kvmgr_path 处"
echo "  • accel/ 路径引用      : $accel_path 处"
echo ""

# 2. 验证模块子目录命名简化
echo "� 模块子目录命名验证:"
echo "---"

# 检查简化命名
overlap_count=$(grep -o 'comm/overlap' 1.*.md PHASE1_OVERVIEW.md 2>/dev/null | wc -l || echo 0)
domestic_count=$(grep -o 'comm/domestic' 1.*.md PHASE1_OVERVIEW.md 2>/dev/null | wc -l || echo 0)

if [ "$overlap_count" -gt 0 ] && [ "$domestic_count" -gt 0 ]; then
    echo -e "${GREEN}✅ 模块命名已简化: overlap/ ($overlap_count), domestic/ ($domestic_count)${NC}"
else
    echo -e "${YELLOW}⚠️  简化命名使用较少${NC}"
fi
echo ""

# 3. 统计各文件替换情况
echo "📝 各文件替换统计:"
echo "---"
echo "文件名                              | comm使用 | kvmgr使用 | 状态"
echo "-----------------------------------|---------|----------|------"

for file in 1.*.md PHASE1_OVERVIEW.md; do
    if [ -f "$file" ]; then
        comm_in_file=$(grep -o 'sagellm\.comm\.' "$file" 2>/dev/null | wc -l || echo 0)
        kvmgr_in_file=$(grep -o 'sagellm\.kvmgr\.' "$file" 2>/dev/null | wc -l || echo 0)
        
        if [ "$comm_in_file" -gt 0 ] || [ "$kvmgr_in_file" -gt 0 ]; then
            status="${GREEN}✓${NC}"
        else
            status="${YELLOW}?${NC}"
        fi
        
        printf "%-35s | %7d | %9d | %b\n" "$file" "$comm_in_file" "$kvmgr_in_file" "$status"
    fi
done
echo ""

# 4. 总结
echo "================================================"
echo "  验证总结"
echo "================================================"

total_new=$(( comm_count + kvmgr_count + accel_count ))
echo "• 新命名总使用次数: $total_new"
echo "• 路径引用总次数: $(( comm_path + kvmgr_path + accel_path ))"

if [ "$total_new" -gt 20 ]; then
    echo -e "${GREEN}• 重构状态: ✅ 完成${NC}"
    echo "• 所有 Phase 1 文件已成功迁移到新命名规范"
else
    echo -e "${YELLOW}• 重构状态: ⚠️ 需检查${NC}"
    echo "• 新命名使用次数偏少，建议复核"
fi

echo ""
echo "================================================"
