import { icon } from "sengen-ui";

// 汎用 VSCode 風 UI ライブラリの操作アイコン (サイドバー/パネル/設定)。
// アプリ固有のモードアイコン (構築/選出/対戦/分析等) はドメイン層側に置く。

// Lucide "panel-right" - サイドバートグル
export const サイドバーアイコン = (size = 16, color = 'currentColor') =>
    icon({ size, color, paths: [
        'M3 3h18v18H3z',
        'M15 3v18',
    ] });

// Lucide "panel-bottom" - パネルトグル
export const パネルアイコン = (size = 16, color = 'currentColor') =>
    icon({ size, color, paths: [
        'M3 3h18v18H3z',
        'M3 15h18',
    ] });

// Lucide "settings" - 設定
export const 設定アイコン = (size = 20, color = 'currentColor') =>
    icon({ size, color, paths: [
        'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
        'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    ] });
