// backend/api/stream-token.js
const StreamChat = require('stream-chat').StreamChat;

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

app.post('/api/stream-token', async (req, res) => {
  const { userId } = req.body;
  
  // Vérifier l'authentification de l'utilisateur ici
  
  const token = serverClient.createToken(userId);
  res.json({ token });
});