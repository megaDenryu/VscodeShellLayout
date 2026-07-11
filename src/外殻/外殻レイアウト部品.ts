import { div, DivC } from "sengen-ui";
import type { HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';
import { 表示状態 } from './表示状態';
import { アクティビティバー, type アクティビティ項目 } from '../アクティビティバー/アクティビティバー';
import { メニューバー } from '../メニューバー/メニューバー';
import { エディタエリア } from '../エディタエリア/エディタエリア';
import { パネルエリア } from '../パネルエリア/パネルエリア';
import { ステータスバー } from '../ステータスバー/ステータスバー';
import { スプリッター } from '../スプリッター/スプリッター';
import type { テーマ配色 } from '../テーマ/テーマ型';
import type { タブ項目 } from '../パネルエリア/タブストリップ';

export interface 外殻レイアウトオプション {
    テーマ?: Partial<テーマ配色>;
    タイトル: string;
    アクティビティ項目一覧: アクティビティ項目[];
    パネルタブ一覧?: タブ項目[];
    右サイドバー有効?: boolean;
    パネル初期表示?: boolean;
    // スロット内容の宣言的注入。呼び出し側はこれらを渡すだけで、
    // 取得→後から子要素追加のような手続き的な late-mutate が不要になる。
    右サイドバー内容?: HtmlComponentBase;
    ステータスバー左?: HtmlComponentBase;
    ステータスバー右テキスト?: string;
}

// 外殻レイアウトが集約する部品の型契約（部品DTO）。
// パネル/サイドバーの開閉状態とスプリッターのリサイズ配線は、他の部品を横断しない
// 表示制御に閉じているため、ここ（作る()のクロージャ）に集約してOrchestrator本体を薄く保つ。
export class 外殻レイアウト部品 {
    private constructor(
        readonly メニューバー: メニューバー,
        readonly アクティビティバー: アクティビティバー,
        readonly エディタエリア: エディタエリア,
        readonly パネルエリア: パネルエリア,
        readonly パネルスプリッター: スプリッター,
        readonly 右サイドバー: DivC,
        readonly サイドバースプリッター: スプリッター,
        readonly ステータスバー: ステータスバー,
    ) {}

    static 作る(オプション: 外殻レイアウトオプション): 外殻レイアウト部品 {
        let パネル表示中 = オプション.パネル初期表示 ?? true;
        let サイドバー表示中 = オプション.右サイドバー有効 ?? false;

        const パネル = new パネルエリア(オプション.パネルタブ一覧 ?? [])
            .setAttributeIf({
                If: !パネル表示中,
                True: { attr: 表示状態.attribute, value: 表示状態.value.collapsed },
            });

        const サイドバー = div({ class: styles.右サイドバー })
            .setAttributeIf({
                If: !サイドバー表示中,
                True: { attr: 表示状態.attribute, value: 表示状態.value.collapsed },
            });
        if (オプション.右サイドバー内容) {
            サイドバー.child(オプション.右サイドバー内容);
        }

        const ステータス = new ステータスバー();
        if (オプション.ステータスバー左) {
            ステータス.左にコンポーネントを追加する(オプション.ステータスバー左);
        }
        if (オプション.ステータスバー右テキスト !== undefined) {
            ステータス.右にテキストを追加する(オプション.ステータスバー右テキスト);
        }

        const パネルスプリッター = new スプリッター('水平', {
            onリサイズ中: (delta) => パネル.高さを変更する(delta),
        });
        const サイドバースプリッター = new スプリッター('垂直', {
            onリサイズ中: (delta) => {
                const 現在幅 = サイドバー.dom.element.offsetWidth;
                const 新幅 = Math.max(150, Math.min(600, 現在幅 - delta));
                サイドバー.setStyleCSS({ width: `${新幅}px` });
            },
        });
        const メニュー = new メニューバー(オプション.タイトル, {
            onサイドバートグル: () => {
                サイドバー表示中 = !サイドバー表示中;
                サイドバー.toggleAttribute(表示状態.attribute, !サイドバー表示中, 表示状態.value.collapsed);
            },
            onパネルトグル: () => {
                パネル表示中 = !パネル表示中;
                パネル.toggleAttribute(表示状態.attribute, !パネル表示中, 表示状態.value.collapsed);
            },
        });

        return new 外殻レイアウト部品(
            メニュー,
            new アクティビティバー(オプション.アクティビティ項目一覧),
            new エディタエリア(),
            パネル,
            パネルスプリッター,
            サイドバー,
            サイドバースプリッター,
            ステータス,
        );
    }
}
