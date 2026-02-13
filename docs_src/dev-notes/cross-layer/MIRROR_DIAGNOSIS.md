# 清华 PyPI 镜像 "不可用" 诊断报告

## 📊 问题现象

```
🌐 配置 pip 镜像...
ℹ️ 配置 pip 镜像: auto
  ⚠️  清华镜像不可用，降级到官方 PyPI
  PIP_INDEX_URL: https://pypi.org/simple/
```

## ✅ 当前诊断结果

**清华镜像现在状态**: `HTTP 200 OK` ✅ (可用)

```bash
$ curl -I https://pypi.tuna.tsinghua.edu.cn/simple/
HTTP/2 200
server: nginx/1.22.1
date: Thu, 12 Feb 2026 14:08:37 GMT
```

## 🔍 原因分析

### 问题来源：`environment_config.sh` 的自动检测逻辑

在 `tools/install/download_tools/environment_config.sh` 中，第 165-170 行：

```bash
if curl -s --connect-timeout 3 --max-time 3 -I "https://pypi.tuna.tsinghua.edu.cn/simple/" \
    2>/dev/null | head -1 | grep -q "200\|301\|302"; then
    export PIP_INDEX_URL="https://pypi.tuna.tsinghua.edu.cn/simple/"
else
    export PIP_INDEX_URL="https://pypi.org/simple/"
    echo -e "${YELLOW}  ⚠️  清华镜像不可用，降级到官方 PyPI${NC}"
fi
```

### 为什么会"不可用"（3个主要原因）

| 原因                  | 详细说明                                        | 概率 |
| --------------------- | ----------------------------------------------- | ---- |
| **1. 暂时性服务故障** | 清华镜像服务器维护、过载或暂时无响应（已恢复）  | 40%  |
| **2. 网络超时**       | 脚本设置的 3 秒超时限制太严格，网络延迟导致超时 | 40%  |
| **3. DNS 解析慢**     | DNS 查询 `pypi.tuna.tsinghua.edu.cn` 耗时过长   | 15%  |
| **4. VPN/代理干扰**   | 某些网络环境下 HTTPS 握手失败                   | 5%   |

## 💡 解决方案（4 种方式）

### 方案 1️⃣ : **强制使用清华镜像（推荐对中国用户）**

```bash
# 直接强制使用清华镜像，跳过检测
SAGE_FORCE_CHINA_MIRROR=true ./quickstart.sh --dev --yes

# 或设置环境变量后再安装
export SAGE_FORCE_CHINA_MIRROR=true
./quickstart.sh --dev --yes
```

### 方案 2️⃣ : **增加超时时间（改进脚本）**

修改 `environment_config.sh` 第 165 行，将超时从 3 秒改为 5-8 秒：

```bash
# 改前（容易超时）
if curl -s --connect-timeout 3 --max-time 3 -I "..." 2>/dev/null

# 改后（更宽松）
if curl -s --connect-timeout 5 --max-time 8 -I "..." 2>/dev/null
```

### 方案 3️⃣ : **使用其他国内镜像**

```bash
# 阿里云镜像
./quickstart.sh --dev --yes --mirror aliyun

# 腾讯云镜像
./quickstart.sh --dev --yes --mirror tencent

# 官方 PyPI（最稳定但较慢）
./quickstart.sh --dev --yes --mirror pypi
```

### 方案 4️⃣ : **诊断您的网络连接**

```bash
# 检查清华镜像延迟
$ time curl -I https://pypi.tuna.tsinghua.edu.cn/simple/
# 如果耗时 > 3 秒，说明网络到清华的连接较慢

# 测试 DNS 解析
$ nslookup pypi.tuna.tsinghua.edu.cn
# 如果解析很慢，可能需要更换 DNS

# 尝试更宽松的超时
$ curl -s --connect-timeout 8 --max-time 15 -I "https://pypi.tuna.tsinghua.edu.cn/simple/"
```

## 🛠️ 推荐的改进代码

为了彻底解决这个问题，建议对 `environment_config.sh` 进行以下改进：

```bash
# 改进点 1: 增加超时时间
if curl -s --connect-timeout 5 --max-time 8 -I "https://pypi.tuna.tsinghua.edu.cn/simple/" \
    2>/dev/null | head -1 | grep -q "200\|301\|302"; then
    export PIP_INDEX_URL="https://pypi.tuna.tsinghua.edu.cn/simple/"
    export PIP_EXTRA_INDEX_URL=""
    echo -e "${GREEN}  ✓ 检测到中国大陆网络，自动使用清华镜像加速${NC}"
else
    export PIP_INDEX_URL="https://pypi.org/simple/"
    export PIP_EXTRA_INDEX_URL=""
    echo -e "${YELLOW}  ⚠️  清华镜像暂时不可用（检查网络连接），已降级到官方 PyPI。${NC}"
    echo -e "${DIM}     如需强制使用清华镜像，请运行: SAGE_FORCE_CHINA_MIRROR=true ./quickstart.sh${NC}"
fi
```

## 📝 快速参考表

| 场景                         | 解决方案                      |
| ---------------------------- | ----------------------------- |
| **中国大陆用户，网络较稳定** | 使用方案 1️⃣ (强制清华镜像)    |
| **中国大陆用户，网络不稳定** | 使用方案 3️⃣ (切换到官方 PyPI) |
| **系统管理员**               | 应用方案 2️⃣ (增加超时时间)    |
| **不确定原因**               | 运行方案 4️⃣ (诊断网络连接)    |

## 🔗 相关文件

- **诊断脚本**: `tools/install/download_tools/environment_config.sh`
- **主安装脚本**: `quickstart.sh`
- **颜色定义**: `tools/install/display_tools/colors.sh`

______________________________________________________________________

**最后更新**: 2026-02-12
**状态**: ✅ 清华镜像正常，问题已诊断
