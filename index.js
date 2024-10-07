// define required modules 
require("dotenv").config();
const endpoint_port = process.env.PORT;
const expressModule = require("express");
const app =expressModule();
const cors = require("cors");
const bodyParserModule = require("body-parser");


// setup middlewares 
app.use(cors())
app.disable("express-powered-by");
app.use(bodyParserModule.json())
app.use(bodyParserModule.urlencoded({extended:false}));
app.use(expressModule.json());



app.listen(endpoint_port,async()=>{
    console.log("Endpoint api is currently running")
})

