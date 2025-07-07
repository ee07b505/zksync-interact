# ZKSync Era 交互撸猫程序

## 项目简介

这是一个用于在 ZKSync Era 网络上进行自动化交互的撸猫项目。该程序可以自动执行多种 DeFi 操作，包括代币交换、流动性提供、NFT 铸造等，以帮助用户获取潜在的空投奖励。

⚠️ **重要声明：此项目目前已经过时，仅供学习参考使用。**

## 主要功能

- 🔄 自动化代币交换（SyncSwap、Mute、SpaceFi等）
- 💧 流动性池操作
- 🎨 NFT 铸造和交互
- 📊 多账户管理
- 🔧 灵活的任务调度系统
- 📝 详细的操作日志记录

## 支持的协议

- **SyncSwap** - DEX 交易和流动性
- **Mute** - 去中心化交易所
- **SpaceFi** - DeFi 协议
- **MintSquare** - NFT 市场
- **其他 ZKSync Era 生态项目**

## 项目结构

```
├── ProjectManager.js      # 主要的项目管理器
├── ZKSYNC.js             # ZKSync 核心交互逻辑
├── app.js                # 应用程序入口
├── config*.json          # 配置文件
├── ABIs/                 # 智能合约 ABI 文件
├── cache/                # 缓存数据
├── utils/                # 工具函数
└── Log/                  # 日志文件
```

## 安装和使用

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置

1. 复制配置文件模板：
   ```bash
   cp config.json.example configMainnet.json
   ```

2. 编辑配置文件，填入你的私钥和其他参数

3. 准备地址列表文件 `address.txt`

### 运行

```bash
npm start
```

## 配置说明

- `configMainnet.json` - 主网配置
- `configTestnet.json` - 测试网配置
- `address.txt` - 账户地址列表
- `proxies.txt` - 代理服务器列表（可选）

## 主要依赖

- `ethers` - 以太坊交互库
- `zksync-web3` - ZKSync 官方 SDK
- `axios` - HTTP 客户端
- `web3` - Web3 工具库

## 功能特性

### 多账户管理
- 支持批量导入账户
- 随机任务分配
- 账户状态跟踪

### 智能任务调度
- 随机延迟执行
- 任务完成状态管理
- 错误重试机制

### 安全特性
- 私钥本地存储
- Gas 费用限制
- 交易失败处理

## 免责声明

1. **教育目的**：此项目仅用于学习和研究目的
2. **风险自担**：使用此代码进行任何操作的风险由用户自行承担
3. **无保证**：作者不对代码的准确性、完整性或适用性做任何保证
4. **过时警告**：此项目可能已经过时，某些功能可能不再工作

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

本项目遵循 MIT 许可证。详见 [LICENSE.txt](LICENSE.txt) 文件。

## 联系方式

如有疑问，请通过 GitHub Issues 联系。

---

**再次提醒：此项目已过时，请谨慎使用，仅供学习参考！**
