
export interface TutorialStep {
  selector: string;
  title: string;
  text: string;
  isActionDriven?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const tutorialSteps: TutorialStep[] = [
  {
    selector: '[data-tutorial-id="seed-seller-modal"]',
    title: 'ようこそ！ (1/13)',
    text: 'Green Worldへようこそ！このチュートリアルでゲームの基本を学びましょう。「次へ」を押して進めてください。',
    position: 'center',
  },
  {
    selector: '[data-tutorial-id="buy-seed-0"]',
    title: '種の購入 (2/13)',
    text: 'まずは植物の種を買いましょう。このボタンを押してアサガオの種を購入します。',
    isActionDriven: true,
    position: 'top',
  },
  {
    selector: '[data-tutorial-id="close-seller-modal"]',
    title: '店を閉じる (3/13)',
    text: '種を買いました！次は「閉じる」ボタンを押して、庭に戻りましょう。',
    isActionDriven: true,
    position: 'top',
  },
  {
    selector: '[data-tutorial-id="main-stats"]',
    title: 'ステータスの見方 (4/13)',
    text: '画面上部では天気、日付、所持金、レベルを確認できます。天気は植物の成長に影響を与えることがあります。',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial-id="co2-stat"]',
    title: 'CO2濃度 (5/13)',
    text: 'これが地球のCO2濃度です。100%になるとゲームオーバー！植物を育ててCO2を減らしましょう。',
    isActionDriven: false,
    position: 'bottom',
  },
  {
    selector: '[data-tutorial-id="select-seed-アサガオ"]',
    title: '種の選択 (6/13)',
    text: 'インベントリにアサガオの種が追加されました。ここをクリックして、植える準備をします。',
    isActionDriven: true,
    position: 'top',
  },
  {
    selector: '[data-tutorial-id="plot-0"]',
    title: '種を植える (7/13)',
    text: '素晴らしい！では、ハイライトされている空き地をクリックして、種を植えましょう。',
    isActionDriven: true,
    position: 'bottom',
  },
  {
    selector: '[data-tutorial-id="water-button-0"]',
    title: '水やり (8/13)',
    text: '植物が育つには水が必要です。ハイライトされた水やりボタンを押して、水をあげましょう。',
    isActionDriven: true,
    position: 'top',
  },
  {
    selector: '[data-tutorial-id="next-day-button"]',
    title: '次の日へ (9/13)',
    text: '植物が育つには時間が必要です。「次の日へ」ボタンを押して、時間を進めましょう。',
    isActionDriven: true,
    position: 'top',
  },
  {
    selector: '[data-tutorial-id="close-summary-button"]',
    title: '一日のまとめ (10/13)',
    text: '一日が終わると、CO2やお⾦の変化が表⽰されます。確認したら、ボタンを押して次の日へ進みましょう。',
    isActionDriven: true,
    position: 'top',
  },
  {
    selector: '[data-tutorial-id="plant-to-sell-0"]',
    title: '植物の選択 (11/13)',
    text: '育ったアサガオがリストに表示されています。クリックして売却対象として選択しましょう。',
    isActionDriven: true,
    position: 'top',
  },
  {
    selector: '[data-tutorial-id="sell-plants-button"]',
    title: '売却の確定 (12/13)',
    text: '合計金額を確認したら、「選択した植物を売る」ボタンを押して売却を完了します。',
    isActionDriven: true,
    position: 'top',
  },
  {
    selector: '[data-tutorial-id="garden-container"]',
    title: 'チュートリアル完了！ (13/13)',
    text: 'お疲れ様でした！これで基本的な操作はマスターしました。自由に植物を育てて、地球を救いましょう！',
    position: 'center',
    isActionDriven: false,
  },
];