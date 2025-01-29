import React from 'react';
import ReactDOM from 'react-dom/client';
import Chatbot from './components/Chatbot';
import './styles/Chatbot.css';

// 環境変数からAPIキーを取得
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error('OpenAI APIキーが設定されていません。');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Chatbot apiKey={apiKey || ''} />
  </React.StrictMode>
);
