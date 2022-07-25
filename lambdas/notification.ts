import * as nodemailer from 'nodemailer';

export const handler = async (event: any = {}): Promise<any> => {
console.log('Estamos en notificaciones')   
var transport = nodemailer.createTransport({
    host: "email-smtp.us-east-2.amazonaws.com",
    port: 2587,
    secure:false,
    auth: {
      user: "AKIAYTHFPL6SOKHIDVUC",
      pass: "BNmu/5EO3dPudjEytthP1zUlx18tRCwAKutITwMDhbvj"
    }
  });
  try {
      await transport.sendMail({
        from:'miguel.sanchez@happyguest.mx',
        to:'vito.corleone.hg@yopmail.com',
        subject:'Modificacion a la tabla',
        text:`Se ha agregado un item ${new Date()}`
      })
      console.log('Envie el mensaje')

    
  } catch (error) {
    console.log('Estamos en el catch')
  }

};
