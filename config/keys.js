/* Dans cette partie on permet à la variable mongoURI d'etre globale dbpassword definit l'acces notre BD mongoDB en ligne c'est le lien SRV
*/
let dbPassword = 'mongodb+srv://acces:'+ encodeURIComponent('acces2019') + '@dbdame-tlsv3.mongodb.net/test?retryWrites=true&w=majority';

//t dbPassword = 'mongodb+srv://'+process.env.USER+':'+process.env.PWD+'@dbdame-tlsv3.mongodb.net/test?retryWrites=true&w=majority';

module.exports = {
    mongoURI: dbPassword
};

//r url = 'mongodb+srv://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+'/'+process.env.DB;
