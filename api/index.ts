import express, { NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'

dotenv.config();
//
import logger from './../Middleware/logger';
//
import Chalk from './../Middleware/Chalk';
const prisma = new PrismaClient()
//
function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
process.env.FORCE_COLOR = 'true';

const app = express();
const defaultPORT = 8800;
const port = process.env.PORT || defaultPORT;
!process.env.PORT && console.log(Chalk('red', `$PORT Not found! Switching to default: ${defaultPORT}`));

app.use(logger);
app.use(async (req, res, next) => {
    await prisma.$disconnect().catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
    next();
})
function slugModify(slug) {
    return process.env.URL + '/' + slug
}
app.post('/submit/url', async (req, res) => {
    const original = req['body'].url;
    const slug = makeId(6);
    const link = await prisma.link.create({
        data: {
            slug,
            original
        }
    })
    link.slug = slugModify(slug);
    res.json(link)
});
app.get('/:slug', async (req, res) => {
    const slug = req.params.slug;
    console.log({slug});
    res.json({slug})
    // const link = await prisma.link.findFirst({
    //     where: {
    //         slug
    //     }
    // });
    // res.redirect(link?.original || process.env.URL || '');
})
// set static folder
// app.use(express.static(path.join(__dirname, 'public')))
// app.listen(port, () => {
//     console.log(Chalk(['BgCyan', 'black'], ` 🏁 UrlShortener is running on port ${port}... `));
// });

// ... you will write your Prisma Client queries here

// const user = await prisma.user.create({
//     data: {
//       name: 'Alice',
//       email: 'alice@prisma.io',
//     },
//   });
// const users = await prisma.user.findMany();
// console.log(users)

export default app;