import passport from 'passport';

import {Strategy} from 'passport-google-oauth2'


export default function setupGoogleOAuth(prisma){
    passport.use(new Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.URL}/google/callback`,
        passReqToCallback:true
    },async (request, accessToken, refreshToken, profile, done)=>{
        console.log({profile});
        
        const user = await prisma.user.findOrCreate({
            data:{
                name:profile.displayName,
                email:profile.email,
                photo:profile.picture,
                googleID:profile.id
            }
        });
        console.log(user);
        
        done(null,profile);
    }));
  
    passport.serializeUser((user,done)=>{
        done(null,user);
    })
    passport.deserializeUser((user,done)=>{
        done(null,user);
    })
}