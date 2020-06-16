const SQUARE_EMPTY = 0;
const SQUARE_PAWN = 1;
const SQUARE_QUEEN = 2;

const COLOR_NONE = 0;
const COLOR_BLACK = 1;
const COLOR_WHITE = 2;

class Piece {
  constructor(type = SQUARE_EMPTY, color = COLOR_NONE) {
    this.color = color;
    this.type = type;
  }

  getColor() {
    return this.color;
  }

  getType() {
    return this.type;
  }

  isValid() {
    return this.color != COLOR_NONE && this.type != SQUARE_EMPTY;
  }

  toString() {
    let s = "";

    if (this.getType() === SQUARE_EMPTY) {
      s += "vide";
    } else if (this.getType() === SQUARE_PAWN) {
      s += "pion";
    } else {
      s += "dame";
    }

    if (this.getColor() === COLOR_BLACK) {
      s += "-noir";
    } else if (this.getColor() === COLOR_WHITE) {
      s += "-blanc";
    } else {
      s += "";
    }

    return s;
  }
}

class Square {
  constructor(ligne = 0, colonne = 0) {
    this.row = ligne;
    this.col = colonne;
  }

  getRow() {
    return this.row;
  }

  getCol() {
    return this.col;
  }
}

class Move {
  constructor(from, to, captured = null, promotion = false) {
    this.from = from;
    this.to = to;
    this.captured = captured;
    this.promotion = promotion;
  }

  getCaptured() {
    return this.captured;
  }

  getFrom() {
    return this.from;
  }

  getTo() {
    return this.to;
  }

  isCapture() {
    return this.captured !== null;
  }

  isPromotion() {
    return this.promotion;
  }
}

class Damier {
  constructor(lignes = 10, colonnes = 10, piecesCountPerColor = 20) {
    this.colonnes = colonnes;
    this.lignes = lignes;
    this.mat = null;

    this.newGame(piecesCountPerColor);
  }

  countCols() {
    return this.colonnes;
  }

  countPieces(color) {
    let r = 0;
    for (let l = 0; l < this.countRows(); ++l) {
      for (let c = 0; c < this.countCols(); ++c) {
        if (this.getPiece(l, c).getColor() === color) {
          r++;
        }
      }
    }
    return r;
  }

  countRows() {
    return this.lignes;
  }

  init() {
    this.mat = [];
    for (let l = 0; l < this.lignes; ++l) {
      this.mat.push([]);
      for (let c = 0; c < this.colonnes; ++c) {
        this.mat[l].push(new Piece());
      }
    }
  }

  findLegalMoves(nextTurn, lastMove) {
    let moves = [];
    let hasCapture = false;
    // nous recupérons tous les coups possibles
    for (let l = 0; l < this.lignes; ++l) {
      for (let c = 0; c < this.colonnes; ++c) {
        let m = this.findPossibleMoves(l, c, nextTurn);
        for (let i = 0; i < m.length; i++) {
          if (m[i].isCapture()) {
            hasCapture = true;
          }
          moves.push(m[i]);
        }
      }
    }

    // on peut continuer de jouer, si le dernier coup est une capture par le joueur en cours
    if (lastMove && (!lastMove.isCapture() || !hasCapture)) {
      return [];
    }

    // nous filtrons pour garder les coups légaux
    let legalMoves = [];
    for (let i = 0; i < moves.length; i++) {
      let m = moves[i];
      if (hasCapture && !m.isCapture()) {
        // il existe une capture, on doit donc jouer la capture uniquement
        continue;
      }
      if (
        lastMove &&
        (m.getFrom().getRow() != lastMove.getTo().getRow() ||
          m.getFrom().getCol() != lastMove.getTo().getCol())
      ) {
        // le dernier coup est une capture, on doit continuer de jouer les captures
        continue;
      }
      legalMoves.push(m);
    }

    return legalMoves;
  }

  findLegalMovesFromSquare(square, nextTurn, lastMove) {
    if (!this.isValidSquare(square)) {
      return [];
    }
    let legalMoves = this.findLegalMoves(nextTurn, lastMove);
    let matchingLegalMoves = [];
    for (let i = 0; i < legalMoves.length; ++i) {
      if (
        legalMoves[i].getFrom().getCol() == square.getCol() &&
        legalMoves[i].getFrom().getRow() == square.getRow()
      ) {
        matchingLegalMoves.push(legalMoves[i]);
      }
    }
    return matchingLegalMoves;
  }

  findLegalMoveFromToSquare(from, to, nextTurn, lastMove) {
    if (!this.isValidSquare(from) || !this.isValidSquare(to)) {
      return null;
    }
    let legalMoves = this.findLegalMoves(nextTurn, lastMove);
    for (let i = 0; i < legalMoves.length; ++i) {
      if (
        legalMoves[i].getFrom().getCol() == from.getCol() &&
        legalMoves[i].getFrom().getRow() == from.getRow() &&
        legalMoves[i].getTo().getCol() == to.getCol() &&
        legalMoves[i].getTo().getRow() == to.getRow()
      ) {
        return legalMoves[i];
      }
    }
    return null;
  }

  findPossibleMoves(l, c, nextTurn) {
    let piece = this.getPiece(l, c);
    if (piece.getColor() != nextTurn) {
      return [];
    }
    let otherColor = nextTurn === COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE;
    let dir = nextTurn === COLOR_WHITE ? 1 : -1;
    let moves = [];

    if (piece.getType() === SQUARE_PAWN) {
      this.findPossibleMovesForPiece(l, c, dir, 1, nextTurn, otherColor, moves);
      this.findPossibleMovesForPiece(
        l,
        c,
        dir,
        -1,
        nextTurn,
        otherColor,
        moves
      );
    } else if (piece.getType() === SQUARE_QUEEN) {
      let maxIter = Math.max(this.countCols(), this.countRows());
      this.findPossibleMovesForPiece(
        l,
        c,
        1,
        1,
        nextTurn,
        otherColor,
        moves,
        maxIter
      );
      this.findPossibleMovesForPiece(
        l,
        c,
        1,
        -1,
        nextTurn,
        otherColor,
        moves,
        maxIter
      );
      this.findPossibleMovesForPiece(
        l,
        c,
        -1,
        1,
        nextTurn,
        otherColor,
        moves,
        maxIter
      );
      this.findPossibleMovesForPiece(
        l,
        c,
        -1,
        -1,
        nextTurn,
        otherColor,
        moves,
        maxIter
      );
    }

    return moves;
  }

  findPossibleMovesForPiece(
    l,
    c,
    dirL,
    dirC,
    nextTurn,
    otherColor,
    moves,
    maxIter = 1
  ) {
    let newL = l + dirL;
    let newC = c + dirC;
    let captureSquare = null;
    let isPawn = this.getPiece(l, c).getType() === SQUARE_PAWN;
    while (this.isValid(newL, newC) && maxIter) {
      let otherPiece = this.getPiece(newL, newC);
      if (otherPiece.isValid()) {
        if (otherPiece.getColor() === nextTurn) {
          return;
        }
        if (!captureSquare) {
          captureSquare = new Square(newL, newC);
        }
        newL = newL + dirL;
        newC = newC + dirC;
        if (!this.isValid(newL, newC) || this.getPiece(newL, newC).isValid()) {
          return;
        }
      }
      let isPromotion = isPawn && (newL === 0 || newL === this.countRows() - 1);
      moves.push(
        new Move(
          new Square(l, c),
          new Square(newL, newC),
          captureSquare,
          isPromotion
        )
      );
      newL = newL + dirL;
      newC = newC + dirC;
      maxIter--;
    }
  }

  getPiece(l, c) {
    if (!this.isValid(l, c)) {
      return new Piece();
    }
    return this.mat[l][c];
  }

  getSquareColor(l, c) {
    return (l + c) % 2 === 0 ? COLOR_BLACK : COLOR_WHITE;
  }

  isEmpty(l, c) {
    return this.isValid(l, c) && !this.getPiece(l, c).isValid();
  }

  isValid(l, c) {
    return l >= 0 && l < this.countRows() && c >= 0 && c < this.countCols();
  }

  isValidSquare(s) {
    return s && this.isValid(s.getRow(), s.getCol());
  }

  newGame(piecesCountPerColor) {
    this.init();
    let lines = Math.round((2 * piecesCountPerColor) / this.colonnes);
    for (let l = 0; l < lines; l++) {
      for (let c = l % 2; c < this.countCols(); c += 2) {
        this.setPiece(l, c, new Piece(SQUARE_PAWN, COLOR_WHITE));
      }
    }
    for (let l = this.countRows() - 1; l >= this.countRows() - lines; l--) {
      for (let c = l % 2; c < this.countCols(); c += 2) {
        this.setPiece(l, c, new Piece(SQUARE_PAWN, COLOR_BLACK));
      }
    }
  }

  play(move) {
    let piece = this.getPiece(move.getFrom().getRow(), move.getFrom().getCol());
    let dirL = move.getFrom().getRow() > move.getTo().getRow() ? -1 : 1;
    let dirC = move.getFrom().getCol() > move.getTo().getCol() ? -1 : 1;
    let l = move.getFrom().getRow();
    let c = move.getFrom().getCol();
    while (l != move.getTo().getRow()) {
      this.setPiece(l, c, new Piece());
      l += dirL;
      c += dirC;
    }
    this.setPiece(
      move.getTo().getRow(),
      move.getTo().getCol(),
      new Piece(
        move.isPromotion() ? SQUARE_QUEEN : piece.getType(),
        piece.getColor()
      )
    );
  }

  render(container, selection = null, legalMoves = null, flip = false) {
    let table = document.createElement("table");
    let l = this.countRows() - 1;
    let maxL = -1;
    let dirL = -1;
    if (flip) {
      l = 0;
      maxL = this.countRows();
      dirL = 1;
    }
    while (l != maxL) {
      var tr = table.appendChild(document.createElement("tr"));
      for (let c = 0; c < this.countCols(); c++) {
        let td = tr.appendChild(document.createElement("td"));
        td.className =
          this.getSquareColor(l, c) === COLOR_WHITE
            ? "case-blanche"
            : "case-noire";
        if (selection && selection.getRow() == l && selection.getCol() == c) {
          td.className += " selected";
        }
        if (legalMoves) {
          for (let k = 0; k < legalMoves.length; k++) {
            if (
              legalMoves[k].getTo().getRow() === l &&
              legalMoves[k].getTo().getCol() === c
            ) {
              td.className += " legal";
              break;
            }
          }
        }

        let div = td.appendChild(document.createElement("div"));
        div.className = this.getPiece(l, c).toString();

        div.dataset.row = l;
        div.dataset.col = c;
      }
      l += dirL;
    }
    container.innerHTML = "";
    container.appendChild(table);
  }

  setPiece(l, c, p) {
    let oldPiece = this.getPiece(l, p);
    this.mat[l][c] = p;
    return oldPiece;
  }
}

class Dames {
  constructor(element_id, clientInfo) {
    let that = this;
    this.clientInfo = clientInfo;
    this.element = document.querySelector(element_id);
    this.playedMoves = 0;
    this.damier = new Damier();
    this.lastMove = null;
    this.nextTurn = COLOR_WHITE;
    this.selectedSquare = null;

    if (this.element) {
      this.damier.render(this.element);
      this.element.addEventListener("click", e => {
        this.action(e);
      });
    }

    if (this.clientInfo && this.clientInfo.socket) {
      this.clientInfo.socket.addEventListener("message", function(e) {
        let msg = JSON.parse(e.data);
        if (msg["type"] === "move") {
          let from = new Square(parseInt(msg.from.row), parseInt(msg.from.col));
          let to = new Square(parseInt(msg.to.row), parseInt(msg.to.col));
          that.action(null, from, to);
        }
          
      });
    }
    
    this.damier.render(this.element, null, [], this.clientInfo && !this.clientInfo.playingWhite);
  }

  action(e, from, to) {
    let destinationSquare;
    let fromSocket = false;
    if (e) {
      let data = e.target.dataset || null;
      if (!data || typeof data.row === "undefined") {
        // juste au cas où ...
        return;
      }
      destinationSquare = new Square(parseInt(data.row), parseInt(data.col));
    } else if (from && to) {
      this.selectedSquare = from;
      destinationSquare = to;
      fromSocket = true;
    } else {
      return;
    }
    let currentLegalMoves = [];
    if (this.selectedSquare) {
      currentLegalMoves = this.play(
        this.selectedSquare,
        destinationSquare,
        fromSocket
      );
    }

    if (!currentLegalMoves.length) {
      currentLegalMoves = this.damier.findLegalMovesFromSquare(
        destinationSquare,
        this.nextTurn,
        this.lastMove
      );
    }

    if (currentLegalMoves.length) {
      this.selectedSquare = currentLegalMoves[0].getFrom();
    } else {
      this.selectedSquare = null;
    }

    if (this.clientInfo && this.clientInfo.socket) {
      if (
        (this.nextTurn === COLOR_WHITE && !this.clientInfo.playingWhite) ||
        (this.nextTurn === COLOR_BLACK && this.clientInfo.playingWhite)
      ) {
        currentLegalMoves = [];
        this.selectedSquare = null;
      }
    }

    this.damier.render(this.element, this.selectedSquare, currentLegalMoves, this.clientInfo && !this.clientInfo.playingWhite);
  }

  play(from, to, fromSocket) {
    let currentLegalMoves = [];
    let move = this.damier.findLegalMoveFromToSquare(
      from,
      to,
      this.nextTurn,
      this.lastMove
    );
    if (move) {
      // jouer le coup dans l'autre client
      if (this.clientInfo && this.clientInfo.socket && !fromSocket) {
               $("#principal_tour").text("C'est le tour de " + this.clientInfo.opponent) ;
        this.clientInfo.socket.send(
          JSON.stringify({
            type: "move",
            opponent: this.clientInfo.opponent,
            from: from,
            to: to
          })
        );
      }
      else{
        $("#principal_tour").text("C'est votre tour");
      }

      // jouer le coup
      this.damier.play(move);
      this.lastMove = move;
      currentLegalMoves = this.damier.findLegalMovesFromSquare(
        to,
        this.nextTurn,
        this.lastMove
      );
      if (!currentLegalMoves.length) {
        this.nextTurn =
          this.nextTurn === COLOR_BLACK ? COLOR_WHITE : COLOR_BLACK;
        this.lastMove = null;

        // verifier la fin de jeu (si l'autre joueur n'a pas non plus de coups à jouer)
        let otherLegalMoves = this.damier.findLegalMoves(
          this.nextTurn,
          this.lastMove
        );
        if (!otherLegalMoves.length) {
          let pb = this.damier.countPieces(COLOR_WHITE);
          let pn = this.damier.countPieces(COLOR_BLACK);
          if (pb > pn) {
            this.clientInfo.socket.send(
            JSON.stringify({ type: "Gagnant", name :this.clientInfo.playingWhite.name })
              );
              this.info("Fin de jeu. Les blancs gagnent!");
          } else if (pn > pb) {
            this.clientInfo.socket.send(
            JSON.stringify({ type: "Perdant", name :this.clientInfo.opponent })
              );
            this.info("Fin de jeu. Les noirs gagnent!");
          } else {
            this.info("Fin de jeu. Partie nulle!");
          }
        }
      }
      this.playedMoves++;
    } else {
      return false;
    }
    return currentLegalMoves;
  }

  info(msg) {
    $("#principal_status").text(msg);
    alert(msg);
  }
}

window.Dames = Dames;
