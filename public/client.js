(function() {
  var ClientInfo = {
    currentUser: null,
    opponent: null,
    playingWhite: null,
    socket: null,
    partiesWin : 0,
    partiesLost : 0,
  };
  window.getClientInfo = function() {
    return ClientInfo;
  };

  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("opponent")) {
    ClientInfo.opponent = urlParams.get("opponent");
  }

  ClientInfo.socket = new WebSocket("wss://" + window.location.host);
  ClientInfo.socket.addEventListener("open", function(e) {
    ClientInfo.socket.addEventListener("message", function(e) {
      var msg = JSON.parse(e.data);
      
      if(msg["type"]=="getParties"){
        ClientInfo.partiesWin=msg["partiesWin"];
        ClientInfo.partiesLost=msg["partiesLost"];
      }
      
      if (msg["type"] === "connectedList") {
        receivedConnectedList(msg.user, msg.list);
      }else if (msg["type"] === "challenge") {
        if (ClientInfo.opponent) {
          return;
        }
        if (
          window.confirm(
            msg["opponent"] +
              " veut vous défier. Cliquez sur OK et vous serez redirigé vers la page de jeu. "
          )
        ) {
          window.location.href = "/play?opponent=" + msg["opponent"];
        }
      } else if (msg["type"] === "startGame") {
        if (!ClientInfo.opponent) {
          return;
        }

        ClientInfo.playingWhite = !!msg["playInWhite"];
        new window.Dames("#principal", ClientInfo);
        $("#principal_partie").text(ClientInfo.currentUser.name + " VS " + ClientInfo.opponent );
        $("#principal_status").text("Dans le jeu Vous  jouez les " + (ClientInfo.playingWhite ? "blancs" : "noirs"));
        $("#principal_tour").text("C'est " + (ClientInfo.playingWhite ? "votre tour" : "le tour de " + ClientInfo.opponent));
      } else if (msg["type"] === "endGame") {
        if (!ClientInfo.opponent) {
          return;
        }

        // éviter de recevoir d'autres messages sur ce socket
        ClientInfo.socket.close();
        
        // informer l'utilisateur
        var reason =
          msg["reason"] === "disconnect"
            ? "L'autre joueur s'est déconnecté!"
            : msg["reason"] === "alreadyInGame"
            ? "Une partie est déjà en cours avec " + msg["opponent"]
            : "";
        reason = "Jeu terminé: " + (reason || "Raison inconnue!");
        $("#principal_status").text(reason);
        window.alert(reason);
        window.location.href = "/dashboard";
      }
    });

    // indiquer au serveur que le socket courant est utilisé pour une partie
    if ($("#principal").length && ClientInfo.opponent) {
      notifyServerAboutGameSocket();
    }

    // mettre à jour la liste toutes les secondes
    //window.setInterval(requestConnectedList, 1000);
    
    requestConnectedList();
    getNbparties();
    requestChallenges();
  });

  ClientInfo.socket.addEventListener("close", function(e) {
    ClientInfo.socket = null;
  });

  function receivedConnectedList(user, list) {
    var div = {};
    var f = {};
    user = user ? user : ClientInfo.currentUser;
    if (!user) {
      return;
    }
    ClientInfo.currentUser = user;
    $(".users-list").each(function() {
      var el = $(this);
      el.find("*").remove();
      for (var i = 0; i < list.length; ++i) {
        if (user && user.name && list[i].name === user.name) {
          continue;
        }
        
       el.append(
          '<tr> <td>' + list[i].name + " </td>" + "<td>" + list[i].partiesWin + "</td>" + '<td>' +list[i].partiesLost + '</td>'+    
         '<td>' +
              '<a class="btn btn-success btn-xs" id = "defier" href="/play?opponent=' +
                    list[i].name +
                     '">' +
                 'Défier' +
               "</a>" +
         '</td> </tr>' 
        );
      }
    });
  }
//demander la liste de users au serveur
  function requestConnectedList() {
    if (!ClientInfo.socket) {
      return;
    }
    ClientInfo.socket.send(JSON.stringify({ type: "getConnectedList" }));
  }
//demander un challenge au serveur
  function requestChallenges() {
    if (!ClientInfo.socket || ClientInfo.opponent) {
      return;
    }
    ClientInfo.socket.send(JSON.stringify({ type: "getChallenges" }));
  }

  function notifyServerAboutGameSocket() {
    if (!ClientInfo.socket) {
      return;
    }
    if (!ClientInfo.currentUser) {
      window.setTimeout(notifyServerAboutGameSocket, 200);
      return;
    }
    ClientInfo.socket.send(
      JSON.stringify({ type: "isGameSocket", opponent: ClientInfo.opponent })
    );
  }
  function getNbparties()
 {
    ClientInfo.socket.send(
      JSON.stringify({ type: "Nbparties",msg:"blabla" })
    );
 }
  
})();

