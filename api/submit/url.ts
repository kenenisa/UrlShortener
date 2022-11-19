// module.exports = (req,res) => {
//     res.json({
//         url:"Unknown"
//     })
// }
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function slugModify(slug){
    return  process.env.URL +'/'+slug
}
export default async (req,res) => {
    // const links = await prisma.link.findMany();
    // console.log({links});
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
    // res.json(links)
}