import type { HtmlComponentBase } from "sengen-ui";
import type { I開閉ボタン } from './開閉ボタン';
import { 表示状態 } from './表示状態';

// 外殻の1領域（右サイドバー・パネル・左サイドバー）の開閉を持つ型。
//
// 人が望む開閉（表示希望）と、いま開けてよいかどうか（利用可能）を別々に持つのは、
// 開けない文脈で領域を閉じたあと、開ける文脈へ戻ったときに人の希望どおりの開閉へ復元するためである。
// 連れの要素を受け取るのは、領域を閉じたときに境界のスプリッターだけが帯として残らないようにするためである。
// 開閉ボタンを登録できるのは、利用不可のあいだ「押せるのに何も起きないボタン」を残さないためである。
export class 開閉できる領域 {
    private _表示希望: boolean;
    private _利用可能 = true;
    private readonly _連れ: readonly HtmlComponentBase[];
    private readonly _開閉ボタン一覧: I開閉ボタン[] = [];

    constructor(
        private readonly _本体: HtmlComponentBase,
        初期表示: boolean,
        ...連れ: (HtmlComponentBase | undefined)[]
    ) {
        this._表示希望 = 初期表示;
        this._連れ = 連れ.filter((要素): 要素 is HtmlComponentBase => 要素 !== undefined);
    }

    // この領域を開閉するボタンを預かる。預かった時点の押せるかどうかをその場で映すため、
    // 登録の前後で見た目と実際の押せるかどうかが食い違わない。
    開閉ボタンを登録する(ボタン: I開閉ボタン): void {
        this._開閉ボタン一覧.push(ボタン);
        ボタン.押せるかを示す(this._利用可能);
    }

    表示中か(): boolean {
        return this._利用可能 && this._表示希望;
    }

    切り替える(): void {
        if (!this._利用可能) return;
        this._表示希望 = !this._表示希望;
        this._見えを合わせる();
    }

    開く(): void {
        if (!this._利用可能) return;
        this._表示希望 = true;
        this._見えを合わせる();
    }

    閉じる(): void {
        this._表示希望 = false;
        this._見えを合わせる();
    }

    利用可能を設定する(利用可能: boolean): void {
        this._利用可能 = 利用可能;
        for (const ボタン of this._開閉ボタン一覧) {
            ボタン.押せるかを示す(利用可能);
        }
        this._見えを合わせる();
    }

    private _見えを合わせる(): void {
        const 隠すか = !this.表示中か();
        this._本体.toggleAttribute(表示状態.attribute, 隠すか, 表示状態.value.collapsed);
        for (const 要素 of this._連れ) {
            要素.toggleAttribute(表示状態.attribute, 隠すか, 表示状態.value.collapsed);
        }
    }
}
