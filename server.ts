import express, { NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import passport from 'passport';
import { PrismaClient } from '@prisma/client'

dotenv.config();
//
import logger from './Middleware/logger';
//
import setupGoogleOAuth from './Auth/Google';
const prisma = new PrismaClient()
//
function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function main() {

    const app = express();
    const port = process.env.NODE_PORT || 8800;

    app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.json());
    app.use(express.urlencoded({
      extended: true
    }));
    app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
    app.get('/google/callback', passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/failed' 
    }));
    app.get('/auth/failed', (req, res) => {
        res.send('Something went wrong...');
    });
    function slugModify(slug){
        return  process.env.URL +'/'+slug
    }
    app.post('/submit/url',async (req,res)=>{
        const original = req['body'].url;
        const slug =  makeId(6);
        const link = await prisma.link.create({
            data:{
                slug,
                original
            }
        })
        link.slug = slugModify(slug);
        res.json(link)
    });
    app.get('/:slug',async (req,res)=>{
        const slug  = req.params.slug;
        const link = await prisma.link.findFirst({where:{
            slug
        }});
        res.redirect(link?.original || process.env.URL || '');
    })
    // app.use(logger);
    // set static folder
    app.use(express.static(path.join(__dirname, 'public')))
    app.listen(port, () => {
        setupGoogleOAuth(prisma);
        console.log(`UrlShortener is running on port ${port}...`);
    });

    // ... you will write your Prisma Client queries here
    console.log("running query");

    // const user = await prisma.user.create({
    //     data: {
    //       name: 'Alice',
    //       email: 'alice@prisma.io',
    //     },
    //   });
    // const users = await prisma.user.findMany();
    // console.log(users)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })