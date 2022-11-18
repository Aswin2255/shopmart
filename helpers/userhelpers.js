var db = require('../coinfig/connection')
var collection = require('../coinfig/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('../app')
let userdata = {}
const shortid = require('shortid');


module.exports={
   signupuser:(userdata)=>{
    let response = {}
    let walet = {
        balance:0,
        credit:[],
        
    }
    let referal = shortid.generate()
    let refcode = userdata.referal
    return new Promise( async (resolve, reject) => {
        let existref = await db.get().collection(collection.usercollection).findOne({referal:refcode})
        let emailexist = await db.get().collection(collection.usercollection).findOne({email:userdata.email})
        let phoneexist = await db.get().collection(collection.usercollection).findOne({phone:userdata.phone})
        if(emailexist||phoneexist){
            reject(response)
        }
        else{
            if(existref){
                let history = {
                    date:new Date().toDateString(),
                    message:"referal bonus credited",
                    amount:25,
                    debit:false
                }
             await db.get().collection(collection.usercollection).updateOne({referal:refcode},{$inc:{'walet.balance':25},$push:{'walet.credit':history}})
             
                walet.balance = 25
                walet.credit.push(history)
                
            }
            userdata.referal = referal
             userdata.pass = await bcrypt.hash(userdata.pass,10)
             userdata.userstatus = true
             userdata.walet = walet
             
             db.get().collection(collection.usercollection).insertOne(userdata)
             response.user = userdata
             resolve(response)
            
        }
        
    })

   },
           
            
       
    loginuser:(userdata)=>{
        let loginstatus = false
        let response = {}
        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection(collection.usercollection).findOne({email:userdata.email})
            console.log(user)
            
            if(user){
                let userstat = user.userstatus
                if(userstat){

                 bcrypt.compare(userdata.pass,user.pass).then((status)=>{
                    if(status){
                        response.user = user
                        response.status = true // this is to check whether user is there
                        resolve(response)
                    console.log("sucess")
                    }
                    else{
                        
                        console.log("failed")
                        response.status = false
                        resolve(response)
                    }
                })
                }
                else{
                    console.log('failed')
                    response.block = true
                    resolve(response)
                }
               
            
            }
            else{
                response.inv = true
                reject(response)
            }
        })

    },
    otphelper:(userphone)=>{
        
        return new Promise(async (resolve, reject) => {
            let phone = await db.get().collection(collection.usercollection).findOne({phone:userphone.phone})
            if(phone){
               resolve(phone)
            }
            let er = "not valid"
            reject(er)
            
        })
    },
    getallusers:()=>{
        return new Promise(async(resolve, reject) => {
            let userdata = await db.get().collection(collection.usercollection).find().toArray()
            resolve(userdata)
            
           
        })
    },
    blockuser:(details)=>{
        let stat = details.status
        let userid = details.userid
      
          return new Promise(async(resolve, reject) => {
            if(stat==='false'){
             await db.get().collection(collection.usercollection).updateOne({_id:ObjectId(userid)},{$set:{
                userstatus:false
             }})
             console.log('worked')
            }
            else{
                await db.get().collection(collection.usercollection).updateOne({_id:ObjectId(userid)},{$set:{
                    userstatus:true
                 }})
            }
            
             resolve(response)
        
            
          })
    },
    unblockuser:(proid)=>{
      
        return new Promise(async(resolve, reject) => {
           await db.get().collection(collection.usercollection).updateOne({_id:ObjectId(proid)},{$set:{
              userstatus:true
           }})
          
           resolve(response)
      
          
        })
  },
  deluser:(proid)=>{
    return new Promise(async(resolve, reject) => {
        await db.get().collection(collection.usercollection).deleteOne({_id:ObjectId(proid)})
        resolve(true)
        
    })
  },
  getoneuser:(userid)=>{
    return new Promise(async(resolve, reject) => {
        let user = await db.get().collection(collection.usercollection).findOne({_id:ObjectId(userid)}).then((user)=>{
            resolve(user)
        })
        
    })
  },
  updateuser:(userdetails,userid)=>{
    let response = {}
    return new Promise(async(resolve, reject) => {
        let exiuser = await db.get().collection(collection.usercollection).findOne({email:userdetails.email})
        console.log("gvfhelooowuiijjkhjjudjhhruurjjfhhfuurjjfhhfjjruufjjfurjfjfjjf")
       
        let userdata = await db.get().collection(collection.usercollection).findOne({_id:ObjectId(userid)})
        console.log('uigfffffffffffffffffffffffffffffffffffffffffffffffffffffff')
        let useremail = userdata.email
        console.log(useremail)
       
        let user = await db.get().collection(collection.usercollection).findOne({_id:ObjectId(userdetails._id)})
        bcrypt.compare(userdetails.pass,user.pass).then((status)=>{
            if(status){
                if(exiuser&&exiuser.email!=useremail){
                
                    response.update = false
                    resolve(response)
                
            
        }
            else{

                db.get().collection(collection.usercollection).updateOne({_id:ObjectId(user._id)},{$set:{
                    name:userdetails.name,
                    email:userdetails.email,
                    phone:userdetails.phone
                }})
                response.update = true
                resolve(response)
               
            }
              
            
            }
            else{
                
                console.log("failed")
                let er = true
                reject(er)
            }
        })

        
    })
  },
  updatepass:(details)=>{
    var response = {}
    return new Promise(async(resolve, reject) => {
        let newpass = details.newpass
        console.log(newpass)
        details.newpass = await bcrypt.hash(details.newpass,10)
             let user = await db.get().collection(collection.usercollection).findOne({_id:ObjectId(details._id)})
             bcrypt.compare(details.oldpass,user.pass).then((status)=>{
                if(status){
                    if(details.oldpass==newpass){
                        response.update = false
                        
                        resolve(response)
                    }
                    else{
                      
                        db.get().collection(collection.usercollection).updateOne({_id:ObjectId(details._id)},{$set:{
                            pass:details.newpass
                        }})
                       response. update = true
                        resolve(response)
                    }
                }
                else{
                    error = true
                    reject(error)
                }
             })
       
    })
  }
  
}
   
