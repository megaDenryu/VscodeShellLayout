export interface テーマ配色 {
    // 外殻フレーム（ダーク）
    アプリ背景: string;
    クローム背景: string;
    クローム境界線: string;
    クロームテキスト: string;
    テキスト主: string;
    テキスト副: string;
    テキスト薄: string;
    アクティブ背景: string;
    ホバー背景: string;
    // コンテンツパネル（ライト）
    パネル背景: string;
    パネル表面: string;
    パネルホバー: string;
    パネル境界線: string;
    パネルテキスト主: string;
    パネルテキスト副: string;
    パネルテキスト薄: string;
    // ステータスバー（ネイビー地に白文字）
    ステータスバーテキスト: string;
    // エディタペイン（タブ群・スプリッター・DnD。独自の暗色系）
    ペイン背景: string;
    ペインタブバー背景: string;
    ペインタブ境界線: string;
    ペインタブテキスト: string;
    ペインタブアクティブテキスト: string;
    ペインアクセント: string;
    ペインスプリッター: string;
    ペイン閉じるホバー: string;
    ペインDnDヒント背景: string;
    // ブランドカラー
    ネイビー: string;
    イエロー: string;
    ブルー: string;
    // タイポグラフィ（配色ではないが、既存のCSS変数適用機構——外殻レイアウトオプション.テーマ /
    // テーマCSS変数名 / css変数() ——にそのまま相乗りさせるため本インターフェースに含める。
    // 新設のためデフォルト値は現行のフォント.標準相当・ウェイト400で、既存アプリの見た目は変わらない）
    基本文字ウェイト: string;
    基本フォントファミリ: string;
}

export interface テーマフォント {
    標準: string;
    モノ: string;
}

export interface テーマ {
    配色: テーマ配色;
    フォント: テーマフォント;
}
