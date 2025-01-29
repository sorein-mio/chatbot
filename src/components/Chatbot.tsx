import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import { AVAILABLE_MODELS, DEFAULT_MODEL, ModelOption } from '../config/models';

/**
 * チャットの1つのエントリーを表す型定義
 * ユーザーの入力とボットの応答のペアを管理
 */
interface ChatEntry {
    user: string;
    bot: string;
}

/**
 * Chatbotコンポーネントのプロパティ型定義
 */
interface ChatbotProps {
    apiKey: string;  // OpenAI APIキー
}

/**
 * Chatbotコンポーネント
 * OpenAI APIを使用してチャットボットの機能を提供する
 * ユーザーとAIの対話を管理し、マークダウン形式の応答をサポート
 */
const Chatbot: React.FC<ChatbotProps> = ({ apiKey }) => {
    // チャットボットのUIサイズ状態
    const [chatbotZoomState, setChatbotZoomState] = useState<'large' | 'middle'>('middle');
    // 選択されているGPTモデル
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
    // 会話履歴を管理する配列
    const [conversation, setConversation] = useState<ChatEntry[]>([]);
    // ユーザー入力テキスト
    const [inputText, setInputText] = useState('');
    // API通信中の状態管理
    const [isLoading, setIsLoading] = useState(false);
    // チャットリストのDOM参照（自動スクロール用）
    const chatListRef = useRef<HTMLUListElement>(null);
    // チャットボット本体のDOM参照（自動スクロール用）
    const chatbotBodyRef = useRef<HTMLDivElement>(null);

    /**
     * OpenAI APIを使用してチャットボットの応答を取得する
     * @param prompt ユーザーの入力プロンプト
     * @returns AIの応答テキスト
     */
    const getChatbotResponse = async (prompt: string): Promise<string> => {
        try {
            // モデル名の変換（O1モデルの場合はgpt-4を使用）
            const actualModel = selectedModel.startsWith('o1') ? 'gpt-4' : selectedModel;
            
            const apiEndpoint = process.env.API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

            try {
                const response = await axios.post(apiEndpoint, {
                    model: actualModel,
                    messages: [
                        { 
                            role: "system", 
                            content: "あなたは優秀なAIアシスタントです。" 
                        },
                        { 
                            role: "user", 
                            content: prompt 
                        }
                    ],
                    temperature: Number(process.env.TEMPERATURE) || 0.5,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    timeout: 30000, // 30秒でタイムアウト
                });

                return response.data.choices[0].message.content.trim();
            } catch (apiError: any) {
                console.error('API Error:', apiError);
                if (apiError.response?.status === 404) {
                    return 'APIエンドポイントが見つかりません。システム管理者に連絡してください。';
                }
                if (apiError.code === 'ERR_BAD_REQUEST') {
                    return '申し訳ありませんが、現在このモデルは利用できません。別のモデルを選択してください。';
                }
                return `エラーが発生しました: ${apiError.message}`;
            }
        } catch (error) {
            console.error('Error fetching chatbot response:', error);
            return '申し訳ありませんが、応答を取得できませんでした。';
        }
    };

    /**
     * チャットボットのUIサイズを切り替える
     */
    const handleZoom = () => {
        setChatbotZoomState(prev => prev === 'large' ? 'middle' : 'large');
    };

    /**
     * ユーザー入力を処理し、AIの応答を取得する
     * 会話履歴を考慮して適切なプロンプトを生成
     */
    const handleSubmit = async () => {
        if (inputText.trim() === '') return;

        setIsLoading(true);
        const userInput = inputText;
        setInputText('');

        const conversationHistory = conversation.map(entry => 
            `${entry.user}\nAI: ${entry.bot}`
        ).join('\n');
        const prompt = `${conversationHistory}\nあなた: ${userInput}`;

        const response = await getChatbotResponse(prompt);
        
        setConversation(prev => [...prev, { user: userInput, bot: response }]);
        setIsLoading(false);
    };

    /**
     * 新しいメッセージが追加されたときに自動スクロールを行う
     */
    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
        if (chatbotBodyRef.current) {
            chatbotBodyRef.current.scrollTop = chatbotBodyRef.current.scrollHeight;
        }
    }, [conversation]);

    return (
        // チャットボットのメインコンテナ
        // ズーム状態に応じてクラスを動的に切り替え
        <div id="chatbot" className={`chatbot ${chatbotZoomState === 'large' ? 'chatbot-zoom' : ''}`}>
            {/* モデル選択とズームコントロールを含むヘッダー部分 */}
            <div className="chatbot-header">
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="model-select"
                >
                    <optgroup label="O1シリーズ">
                        {AVAILABLE_MODELS.filter(model => model.category === 'O1').map(model => (
                            <option 
                                key={model.value} 
                                value={model.value} 
                                title={`${model.description}
入力: ${model.priceInput}/1K tokens
出力: ${model.priceOutput}/1K tokens`}
                            >
                                {model.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="GPT-4シリーズ">
                        {AVAILABLE_MODELS.filter(model => model.category === 'GPT-4').map(model => (
                            <option 
                                key={model.value} 
                                value={model.value} 
                                title={`${model.description}
入力: ${model.priceInput}/1K tokens
出力: ${model.priceOutput}/1K tokens`}
                            >
                                {model.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="GPT-3.5シリーズ">
                        {AVAILABLE_MODELS.filter(model => model.category === 'GPT-3.5').map(model => (
                            <option 
                                key={model.value} 
                                value={model.value} 
                                title={`${model.description}
入力: ${model.priceInput}/1K tokens
出力: ${model.priceOutput}/1K tokens`}
                            >
                                {model.label}
                            </option>
                        ))}
                    </optgroup>
                </select>
                <button onClick={handleZoom} className="chatbot-zoom-button">
                    <span className="material-icons">
                        {chatbotZoomState === 'large' ? 'fullscreen_exit' : 'fullscreen'}
                    </span>
                </button>
            </div>
            
            {/* チャットメッセージを表示するメイン部分 
                会話履歴をスクロール可能なリストとして表示 */}
            <div 
                ref={chatbotBodyRef}
                id="chatbot-body" 
                className={`chatbot-body ${chatbotZoomState === 'large' ? 'chatbot-body-zoom' : ''}`}
            >
                <ul id="chatbot-ul" ref={chatListRef}>
                    {conversation.map((entry, index) => (
                        <React.Fragment key={index}>
                            <li>
                                <div className="chatbot-right">
                                    {entry.user}
                                </div>
                            </li>
                            <li>
                                <div 
                                    className="chatbot-left"
                                    // マークダウン形式のテキストをHTMLに変換して表示
                                    // AIの応答にコードブロックや強調などのマークダウン記法を使用可能
                                    dangerouslySetInnerHTML={{ __html: marked(entry.bot) }}
                                />
                            </li>
                        </React.Fragment>
                    ))}
                </ul>
            </div>

            {/* ユーザー入力フォームと送信ボタンを含むフッター部分
                ローディング中はインジケータを表示 */}
            <div className={`chatbot-footer ${chatbotZoomState === 'large' ? 'chatbot-footer-zoom' : ''}`}>
                {isLoading && <div id="loading-indicator" className="loading-indicator" />}
                <input
                    type="text"
                    id="chatbot-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="メッセージを入力..."
                />
                <button 
                    id="chatbot-submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    送信
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
