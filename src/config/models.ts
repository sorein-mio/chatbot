export interface ModelOption {
    value: string;
    label: string;
    description?: string;
    priceInput?: string;  // 入力トークンの価格（1K tokens あたり）
    priceOutput?: string; // 出力トークンの価格（1K tokens あたり）
    category: 'GPT-4' | 'GPT-3.5' | 'O1' | 'その他';
}

export const AVAILABLE_MODELS: ModelOption[] = [
    {
        value: 'o1-preview',
        label: 'O1 Preview',
        description: '次世代O1モデルのプレビュー版（$0.0150/1K入力トークン、$0.0600/1K出力トークン）',
        priceInput: '$0.0150',
        priceOutput: '$0.0600',
        category: 'O1'
    },
    {
        value: 'gpt-4o',
        label: 'GPT-4 Optimized',
        description: '最適化されたGPT-4モデル（$0.00250/1K入力トークン、$0.01000/1K出力トークン）',
        priceInput: '$0.00250',
        priceOutput: '$0.01000',
        category: 'GPT-4'
    },
    {
        value: 'gpt-4o-mini',
        label: 'GPT-4 Optimized Mini',
        description: '軽量化された最適化GPT-4モデル（$0.000150/1K入力トークン、$0.000600/1K出力トークン）',
        priceInput: '$0.000150',
        priceOutput: '$0.000600',
        category: 'GPT-4'
    },
    {
        value: 'gpt-3.5-turbo',
        label: 'GPT-3.5 Turbo',
        description: '高速で経済的なモデル（16K context）（$0.003/1K入力トークン、$0.006/1K出力トークン）',
        priceInput: '$0.003',
        priceOutput: '$0.006',
        category: 'GPT-3.5'
    }
];

export const DEFAULT_MODEL = 'gpt-4o'; 
