santa jection Hub Web socket API
===

# hub

## `/mobile` routes

- `socket.emit('move', 1)`: 振った
- `socket.emit('join', {name: 'someone', color: 'red'})`: 参加表明 (colorは `'red', 'blu', 'yel', 'gre'`)。受け付けられたら `notify` ルートで `{message: '参加が受け付けられました'}` を受信、受け付けられなかったら　`notify` ルートで `{message: '参加が受け付けられませんでした'}` を受信。
- `socket.emit('glow', null)`: 自分を光らせろと要求する
- `socket.on('notify', [Object])`: 運営からのメッセージ受信

## `/proj` routes

- `socket.on('mobile_move', {method: 'mobile_move', options: ..., timestamp: 12345678999987321})`: サンタが動いた
- `socket.on('join', {method: 'join', options: {id: 'socketid', name: 'someone', color: 'red'}, timestamp: 1234321444)`: 新サンタ加入
- `socket.on('glow_santa', {method: 'glow_santa', options: {id: 'socketid'}, timestamp: 12314123333})`
- `socket.on('change_scene', {method: 'change_scene', options: {???}, timestamp: 12323422224123})`: 画面遷移指示
- `socket.on('initialize', {method: 'initialize', options: {}, timestamp: 12312312323})`: 参加受付状態遷移指示
- `socket.on('start', {method: 'start', options: {}, timestamp: 12332342412321})`: ゲーム開始指示
- `socket.on('notify', {method: 'notify', options: {...}, timestamp: 1231231231})`: 運営からのメッセージを受信
- `socket.on('santa_move', {method: 'santa_move', options: {color: 'red', amount: 123}, timestamp: 1232141312})`: `color` 色のサンタを `amount` だけ進める指示
- `socket.emit('initialized', null)`: 参加受付状態になった
- `socket.emit('started', null)`: ゲームがスタートした
- `socket.emit('ended', null)`: ゲームが終了した
- `socket.emit('goaled', {id: `socketid`})`: `socketid` のサンタがゴールした
- `socket.emit('hit_tonakai', {id: `socketid`})`: `socketid` のサンタがトナカイに衝突した

## `/unnei` routes

- `socket.emit('initialize', null)`: 参加受付状態にしろ
- `socket.emit('start', null)`: ゲームを開始しろ
- `socket.emit('santa_move', {color: 'red', amount: 123})`: `color` 色のサンタを `amount` だけ進めろ
- `socket.emit('change_scene', {???})`: 画面を遷移しろ
- `socket.emit('notify_proj', {message: 'some message'})`: プロジェクタへメッセージ送信
- `socket.emit('notify_mobile', {id: `socketid`, message: 'some message'})`: モバイルへメッセージ送信
