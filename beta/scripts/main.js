// ====================================================================================================
// 定数・変数
// ====================================================================================================

/**
 * リスト：夢コスト
 */
let listCostDefault = [
    // 0 → 1
    5,
    // 1 → 2
    5,
    // 2 → 3
    5,
    // 3 → 4
    8,
    // 4 → 5
    12,
]

/**
 * リスト：キャラクター
 */
let listCharacter = [
    {
        name: "あなた",
        control: true,
        cost: null,
        connect: [],
    },
    {
        name: "町",
        control: false,
        cost: null,
        connect: [],
    },
    {
        name: "なかま1",
        control: false,
        cost: null,
        connect: [],
    },
    {
        name: "なかま2",
        control: false,
        cost: null,
        connect: [],
    },
    {
        name: "なかま3",
        control: false,
        cost: null,
        connect: [],
    },
    {
        name: "なかま4",
        control: false,
        cost: null,
        connect: [],
    },
]

/**
 * 表示キャラクター番号（0から）
 */
let selectCharacterId = null;

// ====================================================================================================
// 初期化
// ====================================================================================================

/**
 * ロード時
 */
window.onload = function() {
    // --------------------------------------------------
    // スマホ非対応
    // --------------------------------------------------

    // スマホの場合
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/.test(navigator.userAgent);
    if (isMobile) {
        // 非対応の旨を表示
        document.querySelector(".only_sp").classList.remove("hidden");
    }

    // --------------------------------------------------
    // データ設定
    // --------------------------------------------------

    let i = 0;
    listCharacter.forEach(target => {
        // コスト設定
        target.cost = [...listCostDefault];

        // つながり
        setConnect(i);

        i++;
    })

    // --------------------------------------------------
    // 初期化
    // --------------------------------------------------

    initialise();

    // --------------------------------------------------
    // 復元
    // --------------------------------------------------

    // ローカルストレージからデータを取得
    let errorFlag = false;
    let localData;
    try {
        localData = JSON.parse(localStorage.getItem("data"));
    } catch {
        errorFlag = true;
    }

    // データが正常に取得でき、ローカルストレージと画面上のデータが異なる場合
    if (
        !errorFlag
        && localData
        && JSON.stringify(listCharacter) != JSON.stringify(localData)
    ) {
        // モーダルを取得
        const templateItem = document.getElementById("temp_modal");
        let modal = templateItem.content.cloneNode(true);

        // メッセージ
        let text = '以前の入力内容を復元しますか？';
        modal.querySelector(".message").innerHTML = text;

        // 「はい」ボタン
        const buttonYed = modal.querySelector(".buttonYes")
        buttonYed.addEventListener(
            "click",
            (() => () => {
                // 以前のデータを取得
                listCharacter = localData;

                // 初期化
                initialise();

                // モーダルを非表示
                hideModal();
            })()
        )

        // モーダルを表示
        document.body.appendChild(modal);
    }
}


/**
 * 初期化
 */
function initialise () {
    // --------------------------------------------------
    // テーブル描画
    // --------------------------------------------------

    // 設定
    drawSetting();

    // つながり
    drawConnect();

    // 計算
    if (selectCharacterId) {
        calcFushigi();
        calcOmoi();
        checkTsuyoiTsunagari();
    }

    // --------------------------------------------------
    // キャラクター名入力欄：フォーカスアウト
    // --------------------------------------------------

    let index = 0;
    document.querySelectorAll('input.input_name').forEach(target => {
        // キャラクター名変更イベント
        nameChange(target, index);

        // フォーカスアウト時にもイベント設定
        target.addEventListener(
            "blur",
            ((index) => (event) => {
                // ＰＣ名の変更
                nameChange(event.target, index);
            })(index)
        )

        index++;
    });

    // --------------------------------------------------
    // スクロールボタン
    // --------------------------------------------------

    document.addEventListener(
        "scroll",
        () => {
            // スクロールボタン
            const buttonScrollUp = document.querySelector(".buttonScroll.up");
            const buttonScrollDown = document.querySelector(".buttonScroll.down");

            // ●スクロール最上段
            if (window.scrollY == 0) {
                // ▼ボタンを出す
                buttonScrollDown.disabled = false;

                // フォーカス
                if (document.activeElement == buttonScrollUp) {
                    buttonScrollDown.focus();
                }

                // ▲ボタンを消す
                buttonScrollUp.disabled = true;
            }
            // ●それ以外
            else {
                // ▲ボタンを出す
                buttonScrollUp.disabled = false;

                // フォーカス
                if (document.activeElement == buttonScrollDown) {
                    buttonScrollUp.focus();
                }

                // ▼ボタンを消す
                buttonScrollDown.disabled = true;
            }
        }
    );
}

/**
 * テーブル描画：設定
 */
function drawSetting() {
    // --------------------------------------------------
    // 通常行
    // --------------------------------------------------

    // テンプレートの読み込み
    const templateItemSelf = document.getElementById("temp_setting_row_self");
    const templateItemFollow = document.getElementById("temp_setting_row_follow");

    // 追加ポイント
    const addPoint = document.getElementById("table_setting");

    // クリア
    addPoint.querySelectorAll("tr:not(.fixedRow)").forEach(target => {
        target.remove();
    })
    document.querySelector(".tab_connect").innerHTML = "";

    // キャラクターごとにループ
    let index = 0;
    let cloneItem;
    listCharacter.forEach(character => {
        // --------------------------------------------------
        // テンプレートを複製
        // --------------------------------------------------

        cloneItem = templateItemFollow.content.cloneNode(true);

        // --------------------------------------------------
        // ID
        // --------------------------------------------------

        cloneItem.firstElementChild.setAttribute("settingId", index);

        // --------------------------------------------------
        // 「コスト」
        // --------------------------------------------------

        let costIndex = 0;
        cloneItem.querySelectorAll('[class^="input_cost_"]').forEach(cost => {
            // 初期値の設定
            cost.value = character.cost[costIndex];

            // 変更イベント
            cost.addEventListener(
                "change",
                ((character, costIndex) => (event) => {
                    // キャラクターリストのコストを更新
                    character.cost[costIndex] = Number(event.target.value);

                    // 再計算
                    calcFushigi();
                })(character, costIndex)
            );

            costIndex++
        });

        // --------------------------------------------------
        // 「番号」
        // --------------------------------------------------

        cloneItem.id += index;
        const elemId = cloneItem.querySelector(".set_id");
        elemId.textContent = index + 1;

        // --------------------------------------------------
        // 「出力」チェック
        // --------------------------------------------------

        // 要素を取得
        const elemCheckControl = cloneItem.querySelector('.checkControl > input[type="checkbox"]');

        // データを読み取り
        const valueCheckControl = listCharacter[index].control;

        // チェック状態を設定
        elemCheckControl.checked = valueCheckControl;

        // 番号の文字色を設定
        elemId.classList.add("name_" + ((valueCheckControl) ? "self" : "follow"));

        // チェック切り替えイベント
        elemCheckControl.addEventListener(
            "change",
            ((index) => (event) => {
                toggleCheckControl(index, event.target.checked);
            })(index)
        );

        // タブボタンを追加
        if (valueCheckControl) {
            // 要素を生成
            let elemTabButton = document.createElement("button");

            // 表示名
            elemTabButton.textContent = listCharacter[index].name;

            // キャラクター番号
            elemTabButton.setAttribute("characterId", index);

            // 押下イベント
            elemTabButton.addEventListener(
                "click",
                ((index) => () => {
                    // キャラクター選択
                    selectCharacterId = index;

                    // 初期化
                    initialise();
                })(index)
            )

            // 追加
            document.querySelector(".tab_connect").appendChild(elemTabButton);
        }

        // --------------------------------------------------
        // 「名前」
        // --------------------------------------------------

        // 設定
        cloneItem.querySelector("input.input_name").value = character.name;

        // 置き換え要素
        const keyName = "replace";
        cloneItem.querySelectorAll('[' + keyName + ']').forEach(item => {
            item.setAttribute(keyName, item.getAttribute(keyName) + index);
        });

        // --------------------------------------------------
        // 「削除」ボタン
        // --------------------------------------------------

        cloneItem.querySelector("button.removeCharacter").addEventListener(
            "click",
                ((i) => () => {
                showModalDelete(i);
            })(index)
        );

        // --------------------------------------------------
        // 要素を追加する
        // --------------------------------------------------

        addPoint.appendChild(cloneItem);

        // --------------------------------------------------

        index++;
    });

    // --------------------------------------------------
    // 最終行
    // --------------------------------------------------

    // テンプレートの読み込み
    const templateItemLast = document.getElementById("temp_setting_row_last");

    // テンプレートを複製
    const cloneItemLast = templateItemLast.content.cloneNode(true);

    // 追加ポイント
    addPoint.appendChild(cloneItemLast);

    // --------------------------------------------------
    // タブボタン
    // --------------------------------------------------

    // 【つながり】エリア
    const containerConnect = document.getElementById("container_connect");

    // ●タブボタンがある（＝操作キャラクターがいる）
    const activeTab = document.querySelectorAll(".tab_connect > button");
    if (activeTab.length > 0) {
        // エリアを表示
        containerConnect.classList.remove("hidden");

        // 選択（初回のみ）
        if (selectCharacterId == null) {
            selectCharacterId = activeTab[0].getAttribute("characterId");
        }

        // タブボタンをアクティブ
        let activeTabButton = document.querySelector('.tab_connect > button[characterId="' + selectCharacterId + '"]');
        if (!activeTabButton) {
            activeTabButton = activeTab[0];
        }
        activeTabButton.classList.add("active");
    }
    // ●それ以外の場合
    else {
        // エリアを非表示
        containerConnect.classList.add("hidden");

        // 選択
        selectCharacterId = null
    }
}

/**
 * テーブル描画：つながり
 */
function drawConnect () {
    // --------------------------------------------------
    // 操作キャラクターなし
    // --------------------------------------------------

    if (selectCharacterId == null) {
        return;
    }

    // --------------------------------------------------
    // 通常行
    // --------------------------------------------------

    // テンプレートの読み込み
    const templateItem = document.getElementById("temp_connect_row");

    // 追加ポイント
    const addPoint = document.getElementById("table_connect");

    // クリア
    addPoint.querySelectorAll("tr:not(.fixedRow)").forEach(target => {
        target.remove();
    })

    // キャラクターごとにループ
    let index = 0;
    listCharacter.forEach(() => {
        // 選択キャラクターは除く
        if (index != selectCharacterId) {
            // テンプレートを複製
            let cloneItem = templateItem.content.cloneNode(true);

            // ID設定
            cloneItem.firstElementChild.setAttribute("characterId", index);
            cloneItem.querySelectorAll('[id]').forEach(target => {
                target.id += index;
            });

            // 置き換え要素
            let keyName = "replace";
            cloneItem.querySelectorAll('[' + keyName + ']').forEach(item => {
                item.setAttribute(keyName, item.getAttribute(keyName) + index);
            });

            // --------------------------------------------------
            // 【つながり】の初期値
            // --------------------------------------------------

            // あなたからの【つながり】
            let to = listCharacter[selectCharacterId];
            const toConnect = to.connect[index];
            // - 前ver対応
            if (!toConnect) {
                toConnect = {
                    before: {
                        name: "",
                        value: "0",
                    },
                    after: {
                        name: "",
                        value: "0",
                    }
                };
            }
            // - 設定：前
            cloneItem.querySelector(".connect.before > input.detail").value = toConnect.before.name;
            cloneItem.querySelector(".connect.before > input.value").value = toConnect.before.value;
            // - 設定：後
            cloneItem.querySelector(".connect.after > input.detail").value = toConnect.after.name;
            cloneItem.querySelector(".connect.after > input.value").value = toConnect.after.value;

            // あいてからの【つながり】
            let from = listCharacter[index];
            const fromConnect = from.connect[selectCharacterId];
            // - 前ver対応
            if (!fromConnect) {
                fromConnect = {
                    before: {
                        name: "",
                        value: "0",
                    },
                    after: {
                        name: "",
                        value: "0",
                    }
                };
            }
            // - 設定
            cloneItem.querySelector(".connect.from > input.detail").value = fromConnect.after.name;
            cloneItem.querySelector(".connect.from > input.value").value = fromConnect.after.value;

            // --------------------------------------------------
            // 「次の強さ」
            // --------------------------------------------------

            calcCost(
                from,
                toConnect.before.value,
                toConnect.after.value,
                cloneItem.querySelector(".connectNote.next > span")
            );

            // --------------------------------------------------
            // 「あいて→あなた」
            // --------------------------------------------------

            // ●出力キャラクターの場合
            if (from.control) {
                // 非活性
                cloneItem.querySelector(".connect.from > input.detail").disabled = true;
                cloneItem.querySelector(".connect.from > input.value").disabled = true;
            }
            // ●それ以外の場合
            else {
                // 「タブを切り替えて入力してください」を削除
                cloneItem.querySelector(".connectNote.from").remove();
            }

            // --------------------------------------------------
            // 【つながり】の強さ変更イベント
            // --------------------------------------------------

            const inputValue = cloneItem.querySelectorAll("input.value");
            inputValue.forEach(target => {
                // キー押下タイミング
                target.addEventListener(
                    "keydown",
                    event => {
                        // 許可するキー
                        if (
                            event.key === "Backspace"
                            || event.key === "Delete"
                            || event.key === "ArrowUp"
                            || event.key === "ArrowDown"
                            || event.key === "Tab"
                            || event.ctrlKey
                        ) {
                            // 何もしない
                            return;
                        }

                        // ●０～５以外が入力された場合
                        const allowedKeys = ["0", "1", "2", "3", "4", "5"];
                        if (allowedKeys.includes(event.key)) {
                            // 入力した数値を適用
                            event.target.value = event.key;
                        }
                        // ●それ以外の場合
                        else {
                            // 入力自体を無効化
                            event.preventDefault();
                        }
                    }
                );

                // 入力適用タイミング
                target.addEventListener(
                    "input",
                    event => {
                        // inputを取得
                        const input = event.target;
                        const value = input.value;

                        // 正規表現：０～５
                        const regex = /^[0-5]$/;

                        // 現在の入力値が無効な場合
                        if (!regex.test(value)) {
                            // 入力した数値を適用
                            input.value = event.data;
                        }
                    }
                );

                // フォーカスアウトタイミング
                target.addEventListener(
                    "blur",
                    event => {
                        // 空欄の場合
                        if (!event.target.value) {
                            // ０を入力
                            event.target.value = 0;
                        }

                        // 一時保存
                        tempSaveData();
                    }
                );
            })

            // --------------------------------------------------
            // あなたからの【つながり】の内容変更イベント
            // --------------------------------------------------

            // 前
            const connectToBeforeDetail = cloneItem.querySelector(".connect.before > input.detail")
            connectToBeforeDetail.addEventListener(
                "change",
                ((index, value) => () => {
                    // 名前変更を全要素に適用
                    changeConnectToBeforeName(index, value);

                    // 一時保存
                    tempSaveData();
                })(index, connectToBeforeDetail.value)
            );

            // 後
            const connectToAfterDetail = cloneItem.querySelector(".connect.after > input.detail")
            connectToAfterDetail.addEventListener(
                "change",
                ((index, value) => () => {
                    // 名前変更を全要素に適用
                    changeConnectToAfterName(index, value);

                    // 一時保存
                    tempSaveData();
                })(index, connectToAfterDetail.value)
            );

            // --------------------------------------------------
            // あいてからの【つながり】の内容変更イベント
            // --------------------------------------------------

            const connectFromDetail = cloneItem.querySelector(".connect.from > input.detail")
            connectFromDetail.addEventListener(
                "change",
                ((index, value) => () => {
                    // 名前変更を全要素に適用
                    changeConnectFromName(index, value);

                    // 一時保存
                    tempSaveData();
                })(index, connectFromDetail.value)
            );

            // --------------------------------------------------
            // あいてからの【つながり】の強さ変更イベント
            // --------------------------------------------------

            const connectFromValue = cloneItem.querySelector(".connect.from > input.value")
            connectFromValue.addEventListener(
                "change",
                () => {
                    // 一時保存
                    tempSaveData();
                }
            );

            // --------------------------------------------------
            // 「次の強さ」
            // --------------------------------------------------

            const elemConnectToValues = cloneItem.querySelectorAll(".connect.to > input.value");
            ["input", "change"].forEach((eventType) => {
                elemConnectToValues.forEach(target => {
                    target.addEventListener(
                        eventType,
                        ((from, index) => () => {
                            const targetRow = document.querySelector('[characterid="' + index + '"]');
                            const before = targetRow.querySelector(".connect.before > input.value").value;
                            const after = targetRow.querySelector(".connect.after > input.value").value;
                            const target = targetRow.querySelector(".connectNote.next > span");

                            calcCost(from, before, after, target);
                        })(from, index)
                    );
                });
            });


            // --------------------------------------------------

            // 要素を追加する
            addPoint.appendChild(cloneItem);
        }

        index++;
    });

    // --------------------------------------------------
    // 最終行
    // --------------------------------------------------

    // テンプレートの読み込み
    const templateItemLast = document.getElementById("temp_connect_row_last");

    // テンプレートを複製
    const cloneItemLast = templateItemLast.content.cloneNode(true);

    // 追加ポイント
    addPoint.appendChild(cloneItemLast);
}

// ====================================================================================================
// ファンクション
// ====================================================================================================

/**
 * つながりデータ設定
 */
function setConnect (i) {
    // キャラクターごとにループ
    for (let j = 0; j < listCharacter.length; j++) {
        let connect = null;

        // データ作成
        if (i != j) {
            connect = {
                before: {
                    name: "",
                    value: "0",
                },
                after: {
                    name: "",
                    value: "0",
                }
            };
        }

        // データを挿入
        listCharacter[i].connect.push(connect)
    }
}

/**
 * 操作チェック
 */
function toggleCheckControl (index, value) {
    // データを変更
    listCharacter[index].control = value;

    // 初期化
    initialise();
}

/**
 * 計算：次の強さ
 */
function calcCost (character, before, after, target) {
    // 次の強さ
    let nextValue = character.cost[Number(after)];

    // 強さが下がるor最大の場合
    if (
        !nextValue
        || Number(before) > Number(after)
    ) {
        nextValue = "-";
    }

    // 描画
    target.textContent = nextValue;
}

/**
 * 計算：ふしぎ（＆夢）
 */
function calcFushigi () {
    // ふしぎ
    let value = 0;
    document.querySelectorAll(".connect_value_to").forEach(target => {
        value += Number(target.value);
    })
    document.getElementById("total_fushigi").textContent = value;

    // 夢
    calcYume();
}

/**
 * 計算：夢
 */
function calcYume () {
    // --------------------------------------------------
    // つながりから夢コストを計算
    // --------------------------------------------------

    for (let i = 0; i < listCharacter.length; i++) {
        // 選択キャラクターは除く
        if (i == selectCharacterId) {
            continue;
        }

        let cost = 0;

        const before = Number(document.querySelector("#connect_to_" + i + " input.connect_before").value);
        const after = Number(document.querySelector("#connect_to_" + i + " input.connect_after").value);

        let change = after - before;

        for (let j = 0; j < change; j++) {
            cost += listCharacter[i].cost[before + j];
        }

        // ［夢］の描画
        document.querySelector("#cost_" + i + " .cost > .value").textContent = cost;
    }

    // --------------------------------------------------
    // トータル表示
    // --------------------------------------------------

    let value = 0;
    document.querySelectorAll(".cost > .value").forEach(target => {
        value += Number(target.textContent);
    })

    document.getElementById("total_yume").textContent = value;
}

/**
 * 計算：想い
 */
function calcOmoi () {
    // 計算
    let value = 0;
    document.querySelectorAll(".connect_value_from").forEach(target => {
        value += Number(target.value);
    })
    document.getElementById("total_omoi").textContent = value;
}

/**
 * ステータス名の取得
 */
function getStatusName (name) {
    return document.getElementById("statusName_" + name).value;
}

/**
 * 【強いつながり】判定
 */
function checkTsuyoiTsunagari () {
    document.querySelectorAll(".connect_row").forEach(row => {
        // 互いの【つながり】の強さが５の場合
        if (
            row.querySelector(".connect_before").value == "5"
            && row.querySelector(".connect_value_from").value == "5"
        ) {
            // 【強いつながり】を表示する
            row.querySelector(".strongConnect").classList.remove("hidden");
        }
    });
}

/**
 * 追加・削除用、データ一時保存
 */
function tempSaveData () {
    // 操作キャラクター
    let to = listCharacter[selectCharacterId];

    // 操作キャラクターが無い場合は、処理を行わない
    if (!to) {
        return;
    }

    // あいて分ループ
    document.querySelectorAll(".connect_row").forEach(target => {
        const index = target.getAttribute("characterId");

        // --------------------------------------------------
        // あなたからの【つながり】
        // --------------------------------------------------

        let toConnect = to.connect[index];

        // 設定：前
        toConnect.before.name = target.querySelector(".connect.before > input.detail").value;
        toConnect.before.value = target.querySelector(".connect.before > input.value").value;

        // 設定：後
        toConnect.after.name = target.querySelector(".connect.after > input.detail").value;
        toConnect.after.value = target.querySelector(".connect.after > input.value").value;

        // --------------------------------------------------
        // あいてからの【つながり】
        // --------------------------------------------------

        let fromConnect = listCharacter[index].connect[selectCharacterId];

        // 設定
        fromConnect.after.name = target.querySelector(".connect.from > input.detail").value;
        fromConnect.after.value = target.querySelector(".connect.from > input.value").value;
    });
}

/**
 * ローカルストレージに保存
 */
function localSave () {
    // 入力内容を保存
    tempSaveData();

    // ローカルストレージに保存
    localStorage.setItem("data", JSON.stringify(listCharacter));

    // --------------------------------------------------
    // アナウンス
    // --------------------------------------------------

    // 表示
    const announce = document.getElementById("announce");
    announce.classList.add("show");

    // 1000ms後、非表示
    setTimeout(() => {
        announce.classList.remove("show");
    }, 1000);
}

// ====================================================================================================
// イベント
// ====================================================================================================

/**
 * キャラクター名の変更
 */
function nameChange (event, index) {
    // キャラクターリストへ反映
    listCharacter[index].name = event.value;

    // 置き換えID
    let target = event.getAttribute("replace");
    if (index == selectCharacterId) {
        target = "name_self";
    }

    // 【つながり】テーブルへ反映
    document.querySelectorAll('span[replace="' + target + '"]').forEach(target => {
        target.textContent = event.value;
    });
}

/**
 * キャラクター「追加」ボタン
 */
function buttonAdd () {
    // 一時保存
    tempSaveData();

    // 末尾に新キャラクターを追加
    const addId = listCharacter.push({
        name: "なかま",
        cost: [...listCostDefault],
        connect: [],
    });
    setConnect(addId - 1);

    // つながり追加
    listCharacter.forEach(target => {
        target.connect.push({
            before: {
                name: "",
                value: "0",
            },
            after: {
                name: "",
                value: "0",
            }
        });
    });

    // 初期化
    initialise();
}

/**
 * あなたからの【つながり】：前の内容変更
 */
function changeConnectToBeforeName (id, value) {
    // 更新
    listCharacter[selectCharacterId].connect[id].before.name = value;

    // 一時保存
    tempSaveData();
}

/**
 * あなたからの【つながり】：後の内容変更
 */
function changeConnectToAfterName (id, value) {
    // 更新
    listCharacter[selectCharacterId].connect[id].after.name = value;

    // 一時保存
    tempSaveData();
}

/**
 * なかまからの【つながり】の内容変更
 */
function changeConnectFromName (id, value) {
    // 更新
    listCharacter[id].connect[selectCharacterId].after.name = value;

    // 一時保存
    tempSaveData();
}

/**
 * キャラクター設定パネルの開閉
 */
function buttonSettingPanel (event) {
    // ボタンの見た目変更
    event.classList.toggle("active");
    document.querySelectorAll(".acordionArrow").forEach(target => {
        target.classList.toggle("hidden");
    });

    // パネルの開閉
    document.querySelector('.pannel_setting').classList.toggle("hidden");
}

/**
 * 「クリップボードにコピーしました」表示
 */
function buttonFadeEvent (event) {
    // 表示
    event.classList.add("active");

    // 1000ms後、非表示
    setTimeout(() => {
        event.classList.remove("active");
    }, 1000);
}

/**
 * コマンド出力：ふしぎ
 */
function buttonFushigi (event) {
    // 「クリップボードにコピーしました」表示
    buttonFadeEvent(event);

    // クリップボードにコピー
    const value = document.getElementById("total_fushigi").textContent;
    navigator.clipboard.writeText(":" + getStatusName("fushigi") + "+" + value);
}

/**
 * コマンド出力：夢
 */
function buttonYume (event) {
    // 「クリップボードにコピーしました」表示
    buttonFadeEvent(event);

    // クリップボードにコピー
    const value = document.getElementById("total_yume").textContent;
    navigator.clipboard.writeText(":" + getStatusName("yume") + "-" + value);
}

/**
 * コマンド出力：想い
 */
function buttonOmoi (event) {
    // 「クリップボードにコピーしました」表示
    buttonFadeEvent(event);

    // クリップボードにコピー
    const value = document.getElementById("total_omoi").textContent;
    navigator.clipboard.writeText(":" + getStatusName("omoi") + "+" + value);
}

/**
 * スクロールボタン：上
 */
function buttonScrollUp () {
    // 最上段にスクロール
    window.scroll({
        top: 0,
    });
}

/**
 * スクロールボタン：下
 */
function buttonScrollDown () {
    // 最下段にスクロール
    window.scroll({
        top: document.body.scrollHeight,
    });
}

/**
 * 「【つながり】表を出力」ボタン
 */
function buttonOutputConnect (event) {
    // --------------------------------------------------
    // 最大長さ
    // --------------------------------------------------

    // キャラクター名
    let maxLengthCharacter = 0

    // つながり：前
    let maxLengthConnectBefore = 0;

    // つながり：後
    let maxLengthConnectAfter = 0;

    // 「スペース調整」ON
    if (document.getElementById("spaceAdjust").checked) {
        // キャラクター名
        maxLengthCharacter = getMaxLength(null, "name");

        // つながり：前
        maxLengthConnectBefore = getMaxLength("connect", "before.name", "未入力");

        // つながり：後
        maxLengthConnectAfter = getMaxLength("connect", "after.name");
    }

    // --------------------------------------------------

    // 文字列の生成
    let totalCost = 0;

    // ＊＊＊の【つながり】
    const targetName = document.querySelector('[settingid="' + selectCharacterId + '"] input.input_name').value;
    let text = targetName + "の【つながり】\r";

    document.querySelectorAll(".connect_row").forEach(row => {
        // 改行
        text += "\r";

        // キャラクター名
        let name = row.querySelector(".name_follow > span").textContent;

        // 前：内容
        let beforeDetail = row.querySelector(".connect.before > input.detail").value;
        if (beforeDetail == "") {
            beforeDetail = "未入力"
        }

        // 前：強さ
        const beforeValue = row.querySelector(".connect.before > .connect_before").value;

        // 後：内容
        let afterDetail = row.querySelector(".connect.after > input.detail").value;
        if (afterDetail == "") {
            afterDetail = "未入力"
        }

        // 後：強さ
        const afterValue = row.querySelector(".connect.after > .connect_after").value;

        // 夢
        const cost = row.querySelector(".cost > .value").textContent;
        totalCost += Number(cost);

        // --------------------------------------------------
        // 文字列を追加
        // --------------------------------------------------

        // キャラクター名・【つながり】前
        text += "●" + padVisualEnd(name, maxLengthCharacter);
        text += " / " + padVisualStart(beforeDetail, maxLengthConnectBefore) + ":" + beforeValue;

        // 【つながり】後・夢
        if (
            beforeDetail != afterDetail
            || beforeValue != afterValue
        ) {
            text += " → " + padVisualStart(afterDetail, maxLengthConnectAfter) + ":" + afterValue;
            text += " （［夢］-" + cost + "）";
        }
    });

    // 合計夢
    if (totalCost > 0) {
        text += "\r";
        text += "\r";
        text += "合計［夢］消費量 : " + totalCost;
    }

    // クリップボードにコピー
    navigator.clipboard.writeText(text);

    // 「クリップボードにコピーしました」表示
    buttonFadeEvent(event);

}

// ====================================================================================================
// モーダル
// ====================================================================================================

/**
 * モーダル非表示
 */
function hideModal () {
    // モーダルを取得
    const modal = document.querySelector(".modal");

    // モーダルを削除
    modal.remove();
}

/**
 * モーダル表示：「削除」ボタン
 */
function showModalDelete (id) {
    // モーダルを取得
    const templateItem = document.getElementById("temp_modal");
    let modal = templateItem.content.cloneNode(true);

    // キャラクター名
    const targetName = document.querySelector('input[replace="name_' + id + '"]');

    // 出力キャラクターか
    const checkControl = targetName.parentElement.parentElement.querySelector('.checkControl > input[type="checkbox"]').checked;
    const nameClass = "name_" + (checkControl ? "self" : "follow");

    // メッセージ
    let name = targetName.value;
    let text = '<span class="' + nameClass + '">' + name + '</span>を削除しますか？';
    modal.querySelector(".message").innerHTML = text;

    // 「はい」ボタン
    const buttonYed = modal.querySelector(".buttonYes")
    buttonYed.addEventListener(
        "click",
        ((id) => () => {
            // --------------------------------------------------
            // 処理
            // --------------------------------------------------

            // 一時保存
            tempSaveData();

            // つながり削除
            listCharacter.forEach(target => {
                target.connect.splice(id, 1);
            });

            // 指定キャラクターを削除
            listCharacter.splice(id, 1);

            // 初期化
            initialise();

            // --------------------------------------------------

            // モーダルを非表示
            hideModal();
        })(id)
    )

    // モーダルを表示
    document.body.appendChild(modal);
}

/**
 * モーダル表示：「【つながり】を確定」ボタン
 */
function showModalDecide (event) {
    // モーダルを取得
    const templateItem = document.getElementById("temp_modal");
    let modal = templateItem.content.cloneNode(true);

    // メッセージ
    let text
        = '<span class="name_self">' + listCharacter[selectCharacterId].name + '</span>'
        + "の【つながり】を確定しますか？<br>"
        + "（変更後の内容・強さで上書きされます）";
    modal.querySelector(".message").innerHTML = text;

    // 「はい」ボタン
    const buttonYed = modal.querySelector(".buttonYes")
    buttonYed.addEventListener(
        "click",
        ((event) => () => {
            // --------------------------------------------------
            // 処理
            // --------------------------------------------------

            // 「入力を確定しました」表示
            buttonFadeEvent(event);

            document.querySelectorAll(".connect_row").forEach(row => {
                const afterDetail = row.querySelector(".connect.after > input.detail").value;
                row.querySelector(".connect.before > input.detail").value = afterDetail;

                const afterValue = row.querySelector(".connect.after > .connect_after").value;
                row.querySelector(".connect.before > .connect_before").value = afterValue;
            });

            // 計算
            calcFushigi();

            // 強いつながり
            checkTsuyoiTsunagari();

            // ローカルストレージに保存
            localSave();

            // --------------------------------------------------

            // モーダルを非表示
            hideModal();
        })(event)
    )

    // モーダルを表示
    document.body.appendChild(modal);
}
