import { div, DivC, LV2HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';

export type スプリッター方向 = '水平' | '垂直';

export interface Iスプリッターリサイズ {
    onリサイズ中: (delta: number) => void;
}

// =============================================================================
// Orchestrator
// =============================================================================

export class スプリッター extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;

    constructor(
        private 方向: スプリッター方向,
        private ハンドラ: Iスプリッターリサイズ,
    ) {
        super();
        this._componentRoot = this._ルートを構築する();
    }

    private _ルートを構築する(): DivC {
        return (
            div({ class: this.方向 === '水平' ? styles.水平 : styles.垂直 })
                .addTypedEventListener('mousedown', (e) => this.ドラッグ開始(e))
        );
    }

    private ドラッグ開始(e: MouseEvent): void {
        e.preventDefault();
        let 前回位置 = this.方向 === '水平' ? e.clientY : e.clientX;
        const カーソル = this.方向 === '水平' ? 'row-resize' : 'col-resize';
        document.body.style.cursor = カーソル;
        document.body.style.userSelect = 'none';

        const onMove = (e: MouseEvent) => {
            const 現在位置 = this.方向 === '水平' ? e.clientY : e.clientX;
            this.ハンドラ.onリサイズ中(現在位置 - 前回位置);
            前回位置 = 現在位置;
        };

        const onUp = () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            // 注意: ドラッグ中はマウスがスプリッター外に出てもイベントを受信する必要があるため、
            // this._componentRoot ではなく document に配線している
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }
}
