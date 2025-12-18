//necessary imports
const express = require('express')
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const userRouter = require("./user");
const adminRouter = require("./admin")

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const secret = process.env.JWT_SECRET

router.use('/users' , userRouter)
router.use('/admin' , adminRouter)

const verificationCodes = new Map();

// Validate email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('⚠️  WARNING: EMAIL_USER or EMAIL_PASS environment variables are not set!');
    console.error('Email OTP functionality will not work without these variables.');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS
    }
  });

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        console.error('Please check your EMAIL_USER and EMAIL_PASS in .env file');
        console.error('For Gmail, make sure you are using an App Password, not your regular password');
    } else {
        console.log('✅ Email transporter is ready to send emails');
    }
});

// -- requires - username , password
router.post('/login' , async(req , res) => {
    try{
        const { email , password } = req.body

        const user = await prisma.user.findUnique({ where: { email } });

        //check for email
        if (!user) {
          return res.status(400).json({ message : 'User email id is incorrect' });
        }

        //check for password 
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message : 'Password is incorrect' });
        }

        const userid = user.id;

        //jwt token for login -- again store this in localstorage of web browser to check if user is already login or not
        const token = jwt.sign({userid} , secret);

        res.status(200).json({
            message : "Login successfully",
            token : token,
            user : {
                id: user.id,
                email: user.email,
                role: user.role,
                profile : user.profile

            }
        });

    }catch(error){
        res.status(500).json({ error: error.message });
    }  
})

// -- requires - email , password , firstname , lastname
router.post('/signup' , async(req , res) => {
    try{
        const { email , password , firstname , lastname , role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        //check for existing users
        if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstname,
                lastname,
                role: role ? role.toUpperCase() : 'USER', //default user if not specified 
            },
        })

        const userid = newUser.id;

        //jwt token created store in... localstorage to check if user is already signin or not
        const token = jwt.sign({userid} , secret);

        res.status(201).json({
            message : "User created successfully",
            token : token,
            user : {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            }
        });

    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

router.post('/send-verification-email', async (req, res) => {
    try{

        console.log("Sending verification email to: ", req.body.email);
        // Check if email configuration is set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
            return res.status(500).json({ 
                error: 'Email service is not configured. Please contact administrator.',
                message: 'Email service is not configured. Please contact administrator.'
            });
        }

        const { email }  = req.body;
        
        // Validate email format
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const verificationCode = crypto.randomInt(1000, 9999);
        verificationCodes.set(email, verificationCode);

        console.log(`Attempting to send verification email to: ${email}`);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification Code',
            text: `Your verification code is: ${verificationCode}`,
        });

        console.log(`✅ Verification email sent successfully to: ${email}`);
        res.status(200).json({ message: 'Verification email sent successfully' });

    }catch(error){
        console.error('❌ Error sending verification email:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to send verification email';
        
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in server configuration.';
        } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            errorMessage = 'Could not connect to email server. Please try again later.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            error: errorMessage,
            message: errorMessage
        });
    }
})

router.post('/verify-code', (req, res) => {
    try{
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }
        const storedCode = verificationCodes.get(email);
    
        if (storedCode && storedCode.toString() === code) {
            verificationCodes.delete(email);

            return res.status(200).json({ message: 'Email verified successfully' });
        }

        res.status(400).json({ error: 'Invalid verification code' });
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;