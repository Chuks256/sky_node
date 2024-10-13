
const ellipticModule = require("elliptic");
const defineEllipticModule = new ellipticModule.ec("ed25519");
const cryptoModule = require("crypto");

const utilHelper={
    generateUserPrivateKey:()=>{
        return defineEllipticModule.genKeyPair().getPrivate({encoding:"utf-8"}).toString("hex");
    },

    generateUserPublicKey:(privatekey="")=>{
        return defineEllipticModule.keyFromPrivate(privatekey).getPublic("hex");
    },

    generateReferralCodes:()=>{
        return cryptoModule.randomBytes(20).toString("hex");
    }
}

module.exports = {utilHelper}