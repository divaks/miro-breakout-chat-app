var express = require('express')
var app = express()
var cors = require('cors')
var http = require('http').Server(app)
var socketConfig = require('./config')
var io = require('socket.io')(http, socketConfig)
const Message = require('./model/Message');
var port = process.env.PORT || 8081

var rooms = {}
var roomsCreatedAt = new WeakMap()
var names = new WeakMap()
var roomId
var name

app.use(cors())

app.get('/rooms/:roomId', (req, res) => {
	const {roomId} = req.params
	const room = rooms[roomId]

	if (room) {
		res.json({
			createdAt: roomsCreatedAt.get(room),
			users: Object.values(room).map((socket) => names.get(socket)),
		})
	} else {
		res.status(500).end()
	}
})

app.get('/rooms', (req, res) => {
	res.json(Object.keys(rooms))
})

io.on('connection', (socket) => {
	socket.on('join', (_roomId, _name, callback) => {
		if (!_roomId || !_name) {
			if (callback) {
				callback('roomId and name params required')
			}
			console.warn(`${socket.id} attempting to connect without roomId or name`, {roomId, name})
			return
		}

		roomId = _roomId
		name = _name

		if (rooms[roomId]) {
			rooms[roomId][socket.id] = socket

			Message.findAll({
				attributes: ['message_text', 'username', 'message_type', 'message_timestamp'],
				where: {
					room_id: roomId
				},
				raw: true,
				order: [
					['message_timestamp', 'ASC']
				]
			})
			.then(messages => {
				let messageHistory = '';
				for(i=0; i<messages.length; i++) {
					if(messages[i].message_type == 'system') {
						messageHistory += '\n' + messages[i].message_text;
					} else {
						messageHistory += '\n' + messages[i].username +
							util.getLocalDateFromISODate(messages[i].message_timestamp) +
							messages[i].message_text;
					}
				}
				io.to(roomId).emit('chat message', `${messageHistory}`)
			})
			.catch(err => console.log(`ERROR: while fetching messages from DB ${err}`));

		} else {
			rooms[roomId] = {[socket.id]: socket}
			roomsCreatedAt.set(rooms[roomId], new Date())
		}
		socket.join(roomId)

		names.set(socket, name)

		io.to(roomId).emit('system message', `${name} joined ${roomId}`)

		Message.create({
			room_id: roomId, 
			message_text: `${name} joined`,
			username: name,
			message_type: 'system'
		})
		.then(truck => console.log(`Message saved successfully - ${name} joined`))
		.catch(err => {
			console.log(err);
			console.log(`An error occurred while trying to save message to database`);
		});			

		if (callback) {
			callback(null, {success: true})
		}
	})

	socket.on('chat message', (msg) => {
		io.to(roomId).emit('chat message', msg, name);

		Message.create({
			room_id: roomId, 
			message_text: msg,
			username: name,
			message_type: 'chat'
		})
		.then(truck => console.log(`Message saved successfully - ${msg}`))
		.catch(err => {
			console.log(err);
			console.log(`An error occurred while trying to save message to database`);
		});	
	})

	socket.on('disconnect', () => {
		io.to(roomId).emit('system message', `${name} left ${roomId}`)

		Message.create({
			room_id: roomId, 
			message_text: `${name} left`,
			username: name,
			message_type: 'system'
		})
		.then(truck => console.log(`Message saved successfully - ${name} left`))
		.catch(err => {
			console.log(err);
			console.log(`An error occurred while trying to save message to database`);
		});			

		delete rooms[roomId][socket.id]

		const room = rooms[roomId]
		if (!Object.keys(room).length) {
			delete rooms[roomId]
		}
	})
})

http.listen(port, '0.0.0.0', () => {
	console.log('listening on *:' + port)
})
