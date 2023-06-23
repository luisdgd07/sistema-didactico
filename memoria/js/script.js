class Memorama {
  constructor() {
    this.canPlay = false;

    this.card1 = null;
    this.card2 = null;

    this.availableImages = ["1.jpg", "2.jpg", "3.jpg", "4.jpg"];
    this.orderForThisRound = [];
    this.cards = Array.from(document.querySelectorAll(".board-game figure"));

    this.maxPairNumber = this.availableImages.length;

    this.startGame();
  }
  startGame() {
    this.foundPairs = 0;
    this.setNewOrder();
    this.setImagesInCards();
    this.openCards();
  }
  setNewOrder() {
    this.orderForThisRound = this.availableImages.concat(this.availableImages);
    this.orderForThisRound.sort(() => Math.random() - 0.5);
  }

  setImagesInCards() {
    for (const key in this.cards) {
      const card = this.cards[key];
      const image = this.orderForThisRound[key];
      const imgLabel = card.children[1].children[0];

      card.dataset.image = image;
      imgLabel.src = `./images/${image}`;
    }
  }

  openCards() {
    this.cards.forEach((card) => card.classList.add("opened"));
    let timerInterval;
    Swal.fire({
      position: "bottom",
      width: 600,
      html: " <h1 style='color: #716add;font-size:50pt'></h1>",
      timer: 5000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("h1");
        timerInterval = setInterval(() => {
          const tiempoRestante = Swal.getTimerLeft();

          const tiempoRestanteSegundos = Math.ceil(tiempoRestante / 1000);

          b.textContent = tiempoRestanteSegundos;
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {});
    setTimeout(() => {
      this.closeCards();
    }, 5000);
  }

  closeCards() {
    this.cards.forEach((card) => card.classList.remove("opened"));
    this.addClickEvents();
    this.canPlay = true;
  }

  addClickEvents() {
    this.cards.forEach((_this) =>
      _this.addEventListener("click", this.flipCard.bind(this))
    );
  }

  removeClickEvents() {
    this.cards.forEach((_this) =>
      _this.removeEventListener("click", this.flipCard)
    );
  }

  flipCard(e) {
    const clickedCard = e.target;

    if (this.canPlay && !clickedCard.classList.contains("opened")) {
      clickedCard.classList.add("opened");
      this.checkPair(clickedCard.dataset.image);
    }
  }

  checkPair(image) {
    if (!this.card1) this.card1 = image;
    else this.card2 = image;

    if (this.card1 && this.card2) {
      if (this.card1 == this.card2) {
        this.canPlay = false;
        setTimeout(this.checkIfWon.bind(this), 300);
      } else {
        this.canPlay = false;
        setTimeout(this.resetOpenedCards.bind(this), 800);
      }
    }
  }

  resetOpenedCards() {
    const firstOpened = document.querySelector(
      `.board-game figure.opened[data-image='${this.card1}']`
    );
    const secondOpened = document.querySelector(
      `.board-game figure.opened[data-image='${this.card2}']`
    );

    firstOpened.classList.remove("opened");
    secondOpened.classList.remove("opened");

    this.card1 = null;
    this.card2 = null;

    this.canPlay = true;
  }

  checkIfWon() {
    this.foundPairs++;

    this.card1 = null;
    this.card2 = null;
    this.canPlay = true;

    if (this.maxPairNumber == this.foundPairs) {
      Swal.fire({
        title: "Genial, has ganado",
        text: "¿Quieres jugar de nuevo?",
        icon: "success",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Volver al inicio",
        confirmButtonText: "Si",
      }).then((result) => {
        if (result.isConfirmed) {
          this.startGame();
        } else {
          window.location.href = "../";
        }
      });
    }
  }

  setNewGame() {
    this.removeClickEvents();
    this.cards.forEach((card) => card.classList.remove("opened"));

    setTimeout(this.startGame.bind(this), 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Memorama();
});
