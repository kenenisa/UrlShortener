// import { NextResponse } from 'next/server';
// import { geolocation, } from '@vercel/edge';
// import { PrismaClient } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
// if (typeof window === "undefined") {
// }

const prisma = new PrismaClient()

export const config = {
    // Only run the middleware on the home route
    matcher: '/:path',
  };
  
export default async (request)=>{
    const url = new URL(request.url);
    if(!url.pathname.includes('api') && prisma){
        const slug = url.pathname.slice(1)
        const link = await prisma.link.findFirst({where:{
            slug
        }});
        Response.redirect(link?.original || process.env.URL || '')
    }
}