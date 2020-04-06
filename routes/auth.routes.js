const {Router} = require('express')
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const router = Router()

//api/auth/
router.post('/register', [
        check('email', 'incorrect email address').isEmail(),
        check('password', 'min length of password 6 symbols, but not more 13 symbols ').isLength(
            {min:6, max: 13})
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors:errors.array(),
                message:'incorrect dara during registration '
            })
        }
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
          return  res.status(400).json(`user ${email} already exist`)
        }
        const hasPassword = await bcrypt.hash(password, 12)

        const user = new User({
            email, password: hasPassword
        })
        await user.save()
        res.status(201).json({message: `user ${email} was created`})

    } catch (e) {
        res.status(500).json({message: 'something error'})
    }
})




//api/login
router.post('/login', [
    check('email', 'incorrect data during login').normalizeEmail().isEmail(),
    check('password', 'incorrect data during login').exists()
],
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                errors:errors.array(),
                message:'incorrect data during login'
            })
            const {email, password} = req.body
            const user = User.findeOne(email)
            if(!user) {
                return  res.status(400).json({
                    message: 'incorrect data'
                })
            }

            const loginPassword = bcrypt.compare(password, user.password)
              if (!loginPassword) {
                  return  res.status(400).json({
                      message: 'incorrect data'
                  })
              }

              const token = jwt.sign(
                  {id: user.id},
                  config.get('secret'),
                  {expiresIn: '1h'}
              )
            res.status(200).json({
                token, userId:user.id
            })

        }
    } catch (e) {
        res.status(500).json({message: 'something error'})
    }
})


module.exports = router