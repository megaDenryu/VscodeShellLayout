import { サイドバーアイコン, パネルアイコン } from '../アイコン/アイコン定義';
import type { Iメニューバーイベント } from './メニューバー';
import { メニューの開閉ボタン } from './メニューの開閉ボタン';

// メニューバーが集約する部品の型契約（部品DTO）。
export class メニューバー部品 {
    private constructor(
        readonly パネルの開閉: メニューの開閉ボタン,
        readonly サイドバーの開閉: メニューの開閉ボタン,
    ) {}

    static 作る(イベント: Iメニューバーイベント): メニューバー部品 {
        return new メニューバー部品(
            new メニューの開閉ボタン(パネルアイコン(16, 'currentColor'), () => イベント.onパネルトグル()),
            new メニューの開閉ボタン(サイドバーアイコン(16, 'currentColor'), () => イベント.onサイドバートグル()),
        );
    }
}
