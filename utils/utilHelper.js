
const ellipticModule = require("elliptic");
const defineEllipticModule = new ellipticModule.ec("ed25519");
const cryptoModule = require("crypto");

const utilHelper={
    generateUserPrivateKey:()=>{
        return defineEllipticModule.genKeyPair().getPrivateKey().toString("hex");
    },

    generateUserPublicKey:(privatekey="")=>{
        return defineEllipticModule.keyFromPrivate(privatekey).getPublicKey().toString("hex");
    },

    generateReferralCodes:()=>{
        return cryptoModule.randomBytes(20).toString("hex");
    }
}

module.exports = {utilHelper}