# hub


# `/mobile` routes

- `socket.emit('move', 1)`: 振った
- `socket.emit('join', {name: 'someone', color: 'red'})`: 参加表明 (colorは `'red', 'blu', 'yel', 'gre'`)
- `socket.emit('glow', null)`

- `socket.on('notify', [Object])`: 運営からのメッセージ受信

# `/proj` routes

- `socket.on('mobile_move', {options: })`:

# `/unnei` routes

- `socket.on('')`
