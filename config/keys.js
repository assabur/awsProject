/* Dans cette partie on permet à la variable mongoURI d'etre globale dbpassword definit l'acces notre BD mongoDB en ligne c'est le lien SRV
*/


dbPassword = 'mongodb+srv://game:'+ encodeURIComponent('game2019') + '@dbDame.mongodb.net/test?retryWrites=true';

module.exports = {
    mongoURI: dbPassword
};
