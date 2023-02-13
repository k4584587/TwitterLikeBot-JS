const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const secretKey = 'your-secret-key'; // secretKey를 정의

// 로그인 API
router.post('/login', function(req, res, next) {
  const { username, password } = req.body;

  // 아이디와 비밀번호 검증 로직
  if (username === 'user' && password === 'password') {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' }); // JWT 토큰 발급
    res.send({ token });
  } else {
    res.status(401).send('Unauthorized');
  }
});

// 인증이 필요한 API
router.get('/protected', (function(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    if (typeof decoded === 'string') {
      return res.status(401).send('Unauthorized');
    }

    const {username} = decoded;
    res.send({username});
  } catch (err) {
    return res.status(401).send('Unauthorized');
  }

}))

module.exports = router;
