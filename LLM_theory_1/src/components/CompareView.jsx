function CompareView({ qwen3Architecture, qwen3Config, qwen3MoeArchitecture, qwen3MoeConfig }) {
    const configComparison = [
        { key: 'hidden_size', label: '隐藏层维度', qwen3: '4096', moe: '2048', different: true },
        { key: 'intermediate_size', label: 'FFN 中间层维度', qwen3: '22016', moe: '6144 (稠密层)', different: true },
        { key: 'moe_intermediate_size', label: 'MoE 专家中间层', qwen3: 'N/A', moe: '768', different: true },
        { key: 'num_hidden_layers', label: '解码器层数', qwen3: '32', moe: '48', different: true },
        { key: 'num_attention_heads', label: '注意力头数 (Q)', qwen3: '32', moe: '32', different: false },
        { key: 'num_key_value_heads', label: 'KV 头数', qwen3: '32 (MHA)', moe: '4 (强 GQA)', different: true },
        { key: 'head_dim', label: '单头维度', qwen3: '128', moe: '64', different: true },
        { key: 'num_experts', label: '专家总数', qwen3: 'N/A', moe: '128', different: true },
        { key: 'num_experts_per_tok', label: '激活专家数', qwen3: 'N/A', moe: '8 (Top-K)', different: true },
        { key: 'vocab_size', label: '词表大小', qwen3: '151936', moe: '151936', different: false },
        { key: 'max_position_embeddings', label: '最大位置', qwen3: '32768', moe: '32768', different: false },
        { key: 'rope_theta', label: 'RoPE 基频', qwen3: '10000', moe: '1000000', different: true },
        { key: 'rms_norm_eps', label: 'RMSNorm ε', qwen3: '1e-6', moe: '1e-6', different: false },
    ];

    const architectureComparison = [
        {
            category: '整体结构',
            items: [
                { aspect: '模型类型', qwen3: '稠密模型 (Dense)', moe: '稀疏混合专家 (Sparse MoE)', highlight: true },
                { aspect: '总参数量', qwen3: '~8B (Qwen3-8B)', moe: '~30B (Qwen3-MoE-30B-A3B)', highlight: true },
                { aspect: '激活参数量', qwen3: '100% (全部)', moe: '~10% (~3B)', highlight: true },
                { aspect: '推理效率', qwen3: '参数量 = 计算量', moe: '大参数量，小计算量', highlight: true },
            ]
        },
        {
            category: '注意力机制',
            items: [
                { aspect: 'Q/K/V 投影', qwen3: '全连接 Linear', moe: '全连接 Linear', highlight: false },
                { aspect: 'Q/K 归一化', qwen3: 'RMSNorm (head_dim)', moe: 'RMSNorm (head_dim)', highlight: false },
                { aspect: '位置编码', qwen3: 'RoPE', moe: 'RoPE', highlight: false },
                { aspect: 'GQA 比例', qwen3: '1:1 (MHA)', moe: '8:1 (强 GQA)', highlight: true },
                { aspect: 'KV Cache 大小', qwen3: '大 (32 KV heads)', moe: '小 (4 KV heads)', highlight: true },
            ]
        },
        {
            category: 'FFN / MLP 层',
            items: [
                { aspect: '结构类型', qwen3: 'Qwen3MLP (SwiGLU)', moe: 'Qwen3MoeSparseMoeBlock', highlight: true },
                { aspect: '激活函数', qwen3: 'SiLU', moe: 'SiLU', highlight: false },
                { aspect: '专家数量', qwen3: '1 (单一 MLP)', moe: '128 个独立专家', highlight: true },
                { aspect: '路由机制', qwen3: '无', moe: 'Softmax + Top-8', highlight: true },
                { aspect: '辅助损失', qwen3: '无', moe: 'Load Balancing Loss', highlight: true },
            ]
        },
        {
            category: '输出与损失',
            items: [
                { aspect: '输出类型', qwen3: 'CausalLMOutputWithPast', moe: 'MoeCausalLMOutputWithPast', highlight: true },
                { aspect: 'router_logits', qwen3: '无', moe: '有 (用于辅助损失)', highlight: true },
                { aspect: 'aux_loss', qwen3: '无', moe: '有 (负载均衡)', highlight: true },
            ]
        },
    ];

    const keyCodeDifferences = [
        {
            title: 'MLP 层定义',
            qwen3Code: `class Qwen3MLP(nn.Module):
    def __init__(self, config):
        self.gate_proj = nn.Linear(hidden_size, intermediate_size, bias=False)
        self.up_proj = nn.Linear(hidden_size, intermediate_size, bias=False)
        self.down_proj = nn.Linear(intermediate_size, hidden_size, bias=False)
        
    def forward(self, x):
        return self.down_proj(self.act_fn(self.gate_proj(x)) * self.up_proj(x))`,
            moeCode: `class Qwen3MoeSparseMoeBlock(nn.Module):
    def __init__(self, config):
        self.gate = nn.Linear(hidden_size, num_experts, bias=False)  # 路由器
        self.experts = nn.ModuleList([
            Qwen3MoeMLP(config, intermediate_size=moe_intermediate_size)
            for _ in range(num_experts)  # 128 个专家
        ])
        
    def forward(self, hidden_states):
        router_logits = self.gate(hidden_states)
        routing_weights, selected_experts = torch.topk(
            F.softmax(router_logits, dim=1), 
            self.top_k, dim=-1
        )  # 选 Top-8
        # ... 专家计算与加权聚合`,
        },
        {
            title: 'DecoderLayer MLP 选择',
            qwen3Code: `class Qwen3DecoderLayer:
    def __init__(self, config, layer_idx):
        self.mlp = Qwen3MLP(config)  # 始终使用普通 MLP`,
            moeCode: `class Qwen3MoeDecoderLayer:
    def __init__(self, config, layer_idx):
        # 根据配置决定使用 MoE 还是普通 MLP
        if (layer_idx not in config.mlp_only_layers) and \\
           (config.num_experts > 0 and 
            (layer_idx + 1) % config.decoder_sparse_step == 0):
            self.mlp = Qwen3MoeSparseMoeBlock(config)  # MoE 层
        else:
            self.mlp = Qwen3MoeMLP(config)  # 普通 MLP`,
        },
        {
            title: 'K/V 投影维度',
            qwen3Code: `# MHA: Q, K, V 维度相同
self.k_proj = nn.Linear(
    hidden_size,                    # 4096
    num_key_value_heads * head_dim, # 32 * 128 = 4096
    bias=False
)`,
            moeCode: `# 强 GQA: K/V 维度远小于 Q
self.k_proj = nn.Linear(
    hidden_size,                    # 2048
    num_key_value_heads * head_dim, # 4 * 64 = 256 ⭐
    bias=False
)
# 每 8 个 Q head 共享 1 个 KV head`,
        },
    ];

    return (
        <div className="compare-container fade-in">
            {/* Left Column - Qwen3 Dense */}
            <div className="compare-column">
                <div className="compare-header dense">
                    <h2 className="compare-title">🔷 Qwen3 (稠密模型)</h2>
                    <p className="compare-subtitle">Dense Model - 全参数激活</p>
                </div>
                <div className="compare-content">
                    {/* Config Comparison */}
                    <div className="diff-section">
                        <h3 className="diff-title">
                            ⚙️ 配置参数
                        </h3>
                        {configComparison.map((item) => (
                            <div key={item.key} className="diff-item">
                                <span className="diff-key">{item.label}</span>
                                <span className={`diff-value ${item.different ? 'highlight' : ''}`}>
                                    {item.qwen3}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Architecture Comparison */}
                    {architectureComparison.map((section) => (
                        <div key={section.category} className="diff-section">
                            <h3 className="diff-title">
                                📊 {section.category}
                            </h3>
                            {section.items.map((item) => (
                                <div key={item.aspect} className="diff-item">
                                    <span className="diff-key">{item.aspect}</span>
                                    <span className={`diff-value ${item.highlight ? 'highlight' : ''}`}>
                                        {item.qwen3}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Code Differences */}
                    <div className="diff-section">
                        <h3 className="diff-title">💻 关键代码差异</h3>
                        {keyCodeDifferences.map((diff) => (
                            <div key={diff.title} style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    {diff.title}
                                </div>
                                <div className="code-block">
                                    <div className="code-content">
                                        <pre style={{ fontSize: '0.8rem' }}>{diff.qwen3Code}</pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Qwen3 MoE */}
            <div className="compare-column">
                <div className="compare-header moe">
                    <h2 className="compare-title">🔶 Qwen3-MoE (混合专家)</h2>
                    <p className="compare-subtitle">Sparse MoE - 部分专家激活</p>
                </div>
                <div className="compare-content">
                    {/* Config Comparison */}
                    <div className="diff-section">
                        <h3 className="diff-title">
                            ⚙️ 配置参数
                            <span className="diff-badge different" style={{ marginLeft: '8px' }}>差异项</span>
                        </h3>
                        {configComparison.map((item) => (
                            <div key={item.key} className="diff-item">
                                <span className="diff-key">{item.label}</span>
                                <span className={`diff-value ${item.different ? 'highlight' : ''}`}>
                                    {item.moe}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Architecture Comparison */}
                    {architectureComparison.map((section) => (
                        <div key={section.category} className="diff-section">
                            <h3 className="diff-title">
                                📊 {section.category}
                            </h3>
                            {section.items.map((item) => (
                                <div key={item.aspect} className="diff-item">
                                    <span className="diff-key">{item.aspect}</span>
                                    <span className={`diff-value ${item.highlight ? 'highlight' : ''}`}>
                                        {item.moe}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Code Differences */}
                    <div className="diff-section">
                        <h3 className="diff-title">💻 关键代码差异</h3>
                        {keyCodeDifferences.map((diff) => (
                            <div key={diff.title} style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    {diff.title}
                                </div>
                                <div className="code-block">
                                    <div className="code-content">
                                        <pre style={{ fontSize: '0.8rem' }}>{diff.moeCode}</pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompareView;
