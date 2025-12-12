const express = require('express')
const jwt = require('jsonwebtoken');
const authmiddleware = require('../middleware/authmiddleware');
const router = express.Router();
const multer = require('multer');
const { uploadPDFFromBuffer } = require('../cloudinary');

const app = express();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Multer setup for PDF uploads (max 5MB, PDFs only)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    },
});

router.post('/create-notice' , authmiddleware , upload.single('pdf'), async(req , res) => {
    try{
        const { title , content } = req.body;
        const file = req.file;

        const userid = req.userid;

        const user = await prisma.user.findUnique({
            where : {id : userid}
        })

        if(!user || user.role != "ADMIN"){
            return res.status(404).json({ error: 'unauthorised'});
        }

        let pdfUrl = null;
        let pdfPublicId = null;

        if (file) {
            const uploadResult = await uploadPDFFromBuffer(file.buffer, {
                folder: 'notices',
                public_id: `notice-${Date.now()}`
            });
            pdfUrl = uploadResult.secure_url;
            pdfPublicId = uploadResult.public_id;
        }

        const newNotice = await prisma.notice.create({
            data: {
                title,
                content,
                pdfUrl,
                pdfPublicId,
                userId : userid
            },
        })

        res.status(201).json({
            message : "Notice created successfully",
            Notice : {
                id: newNotice.id,
                title: newNotice.title,
                content: newNotice.content,
                pdfUrl: newNotice.pdfUrl,
            }   
        });

    }catch(error){
        if (error.message === 'Only PDF files are allowed' || error.message.includes('File too large')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
})

router.put('/edit-moderator' , authmiddleware , async(req , res) => {
    try{   
        const {email , role } = req.body

        const userid = req.userid;

        const Normaluser = await prisma.user.findUnique({
            where : {email : email}
        })

        const user = await prisma.user.findUnique({
            where : {id : userid}
        })

        if(!Normaluser){
            return res.status(404).json({ error: 'The email you entered does not exist'});
        }

        if(user.role != "ADMIN"){
            return res.status(404).json({ error: 'unauthorised'});
        }

        const newRole = await prisma.user.update({
            where : {email : email},
            data : {
                role : role,
            }
        })


        res.status(201).json({
            message : 'User role updated successfully.',
            user : newRole,
        });

    }catch(error){
        res.status(500).json({ error: 'An error occurred while updating the user role.' });

    }
})

router.get("/user-data", authmiddleware, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });


        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch user data." });
    }
});

module.exports = router;
