// Simple state
const state = {
  successMessage: ""
};

function updateSuccessMessage(message) {
  state.successMessage = message;
}

//Elements
function InputGroup() {
  const element = document.createElement("div");
  element.setAttribute("class", "input-group");
  return element;
}

function Label(text) {
  const element = document.createElement("span");
  element.innerText = text;
  return element;
}

function SendMoneyButton() {
  const element = document.createElement("a");
  element.innerText = "Send Money";
  element.setAttribute("class", "btn");
  element.setAttribute("href", "#/sendMoney");
  return element;
}

function TransactionHistoryButton() {
  const element = document.createElement("a");
  element.innerText = "Transaction History";
  element.setAttribute("class", "btn");
  element.setAttribute("href", "#/transactions");
  return element;
}

class Screen {
  constructor() {
    this.App = document.getElementById("app");

    this.TitleBar = document.createElement("div");
    this.TitleBar.setAttribute("class", "title-bar");

    this.OptionsBar = document.createElement("div");
    this.OptionsBar.setAttribute("class", "options-bar");

    this.Content = document.createElement("div");
    this.Content.setAttribute("class", "main-content layout-column");
  }

  render() {
    this.App.innerHTML = "";
    this.App.appendChild(this.TitleBar);
    this.App.appendChild(this.OptionsBar);
    this.App.appendChild(this.Content);
  }
}

class HomeScreen extends Screen {
  constructor() {
    super();
    this.title = "What are we doing?";
  }

  render() {
    this.TitleBar.innerText = this.title;
    const element = document.createElement("div");
    element.setAttribute("class", "home");
    element.appendChild(SendMoneyButton());
    element.appendChild(TransactionHistoryButton());
    this.Content.innerHTML = "";
    this.OptionsBar.innerHTML = "";
    this.Content.appendChild(element);
    super.render();
  }
}

class TransactionScreen extends Screen {
  constructor() {
    super();
    this.title = "Transaction History";
    this.transactions = [];
    this.limit = 20;
    this.offset = 0;
    this.totalTransactions = 0;
    this.fetching = false;
    this.fetched = false;
    this.nextPage();
  }

  nextPage() {
    if (!this.fetched || this.transactions.length < this.totalTransactions) {
      this.fetching = true;
      fetch(
        `http://localhost:3000/transactions/d1c8b729-8f91-47a7-8c82-3b7f19667a26?limit=${
          this.limit
        }&offset=${this.offset}`
      )
        .then(response => {
          if (!this.totalTransactions) {
            this.totalTransactions = response.headers.get(
              "x-meta-result-count"
            );
          }
          return response.json();
        })
        .then(
          transactions =>
            (this.transactions = this.transactions.concat(transactions))
        )
        .then(() => (this.fetching = false))
        .then(() => (this.fetched = true))
        .then(() => (this.offset = this.offset + this.limit))
        .then(() => this.render());
    }
  }

  get List() {
    const element = document.createElement("div");
    element.setAttribute("style", "overflow-y: scroll;");
    element.onscroll = event => {
      const { scrollTop, scrollHeight } = event.target;
      const distance = scrollHeight - scrollTop;
      const target = scrollHeight * 0.75;
      if (distance < target && !this.fetching) {
        this.nextPage();
      }
    };
    this.transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      var dateDisplay = [
        date.getMonth(),
        date.getDate(),
        date.getFullYear()
      ].join("/");
      const row = document.createElement("div");
      row.setAttribute("class", "layout-row transaction-item");
      const col1 = document.createElement("div");
      const col2 = document.createElement("div");
      const col3 = document.createElement("div");
      col1.innerText = dateDisplay;
      col2.innerText = transaction.payee.name;
      col3.innerText =
        transaction.amount.currency.symbol +
        transaction.amount.total.toFixed(2);
      row.appendChild(col1);
      row.appendChild(col2);
      row.appendChild(col3);
      element.appendChild(row);
    });
    return element;
  }

  get BackButton() {
    const element = document.createElement("a");
    element.setAttribute("class", "btn");
    element.setAttribute("href", "#");
    element.innerText = "Back";
    return element;
  }

  render() {
    this.TitleBar.innerText = this.title;
    this.Content.innerHTML = "";
    this.OptionsBar.innerHTML = "";
    this.Content.appendChild(this.List);
    this.OptionsBar.appendChild(this.BackButton);
    super.render();
  }
}

class SendMoneyScreen extends Screen {
  constructor() {
    super();
    this.title = "Send Money";
    this.descriptions = [];
    this.currencies = [];
    this.pending = false;
    this.initializeData();

    Promise.all([
      fetch("http://localhost:3000/descriptions")
        .then(response => response.json())
        .then(descriptions => (this.descriptions = descriptions))
        .then(() => (this.fields.description.value = this.descriptions[0])),
      fetch("http://localhost:3000/currencies")
        .then(response => response.json())
        .then(currencies => currencies.sort((a, b) => a.sort > b.sort))
        .then(currencies => (this.currencies = currencies))
        .then(() => (this.fields.currency.value = this.currencies[0]))
    ]).then(() => this.render());
  }

  initializeData() {
    this.fields = {
      payee: {
        value: "",
        valid: false,
        showValidation: false
      },
      amount: {
        value: parseFloat(0).toFixed(2),
        showValidation: false,
        valid: false
      },
      currency: {
        value: this.currencies.length ? this.currencies[0] : { symbol: "" }
      },
      message: {
        value: ""
      },
      description: {
        value: this.descriptions.length ? this.descriptions[0] : {}
      }
    };
  }

  handleOnClear() {
    this.initializeData();
    this.render();
  }

  handleUpdateMessage(event) {
    this.fields.message.value = event.target.value;
    this.render();
  }

  handleSelectDescription(event) {
    const descriptionId = event.target.getAttribute("data-id");
    this.fields.description.value = this.descriptions.find(
      description => description.id === descriptionId
    );
    this.render();
  }

  handlePayeeValidation(event) {
    const { value } = event.target;
    const { payee } = this.fields;
    payee.value = value;
    payee.valid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      value
    );
    payee.showValidation = true;
    this.render();
  }

  handleCurrencyChange(event) {
    this.fields.currency.value = this.currencies.find(
      currency => currency.id === event.target.value
    );

    this.render();
  }

  handleAmountChange(event) {
    let value = event.target.value;
    const { amount } = this.fields;
    if (!value || value < 0) {
      value = 0;
      amount.showValidation = true;
      amount.valid = false;
    } else {
      amount.valid = true;
      amount.showValidation = false;
    }
    amount.value = parseFloat(value).toFixed(2);
    this.render();
  }

  handleSubmit() {
    const { amount, description, currency, payee, message } = this.fields;
    const body = {
      amount: amount.value,
      description: description.value,
      currency: currency.value,
      payee: payee.value,
      message: message.value
    };

    this.pending = true;
    this.render();
    fetch("http://localhost:3000/transactions", {
      method: "POST",
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(transaction => {
        const { currency, amount, payee } = transaction;
        this.pending = false;
        updateSuccessMessage(
          `You have sent ${currency.symbol}${amount} to ${payee.name}!`
        );
        window.location = "#/sendMoney/success";
      });
  }

  get PayeeInput() {
    const inputGroup = InputGroup();
    const inputGroupClass = inputGroup.getAttribute("class");
    inputGroup.setAttribute("class", inputGroupClass + " layout-row");
    const element = document.createElement("input");
    element.setAttribute("type", "email");
    element.setAttribute("required", true);
    element.setAttribute("value", this.fields.payee.value);
    element.onblur = this.handlePayeeValidation.bind(this);
    const label = Label("To:");
    label.setAttribute("class", "vertical-label");
    inputGroup.appendChild(label);
    inputGroup.appendChild(element);
    if (this.fields.payee.showValidation) {
      const valid = document.createElement("span");
      valid.setAttribute("class", "valid");
      if (this.fields.payee.valid) {
        valid.innerHTML = "&#9989;";
      } else {
        valid.innerHTML = "&#10060;";
      }
      inputGroup.appendChild(valid);
    }
    return inputGroup;
  }

  get AmountInput() {
    const inputGroup = InputGroup();
    const inputGroupClass = inputGroup.getAttribute("class");
    inputGroup.setAttribute("class", inputGroupClass + " layout-row");
    const element = document.createElement("input");
    element.setAttribute("required", true);
    element.setAttribute("value", this.fields.amount.value);
    element.onblur = this.handleAmountChange.bind(this);
    const label = Label("Amount: " + this.fields.currency.value.symbol);
    label.setAttribute("class", "vertical-label");
    inputGroup.appendChild(label);
    inputGroup.appendChild(element);
    if (this.fields.amount.showValidation) {
      const valid = document.createElement("span");
      valid.setAttribute("class", "valid");
      valid.setAttribute("style", "margin-right: 10px");
      if (!this.fields.payee.valid) {
        valid.innerHTML = "&#10060;";
      }
      inputGroup.appendChild(valid);
    }
    inputGroup.appendChild(this.CurrencySelect);
    return inputGroup;
  }

  get CurrencySelect() {
    const element = document.createElement("select");
    element.onchange = this.handleCurrencyChange.bind(this);
    this.currencies.forEach(currency => {
      let option = document.createElement("option");
      option.setAttribute("value", currency.id);
      option.innerText = currency.abbreviation;
      element.appendChild(option);
    });

    return element;
  }

  get MessageInput() {
    const inputGroup = InputGroup();
    const element = document.createElement("textarea");
    element.innerText = this.fields.message.value;
    element.onblur = this.handleUpdateMessage.bind(this);
    const inputGroupClass = inputGroup.getAttribute("class");
    inputGroup.setAttribute("class", inputGroupClass + " layout-column");
    inputGroup.setAttribute("style", "margin-bottom: 4vh");
    inputGroup.appendChild(Label("Message (optional):"));
    inputGroup.appendChild(element);
    return inputGroup;
  }

  get DescriptionInput() {
    const wrapper = document.createElement("div");
    const title = document.createElement("div");
    title.innerText = "What's this payment for?";
    title.setAttribute("style", "margin-bottom: 2vh;");
    wrapper.appendChild(title);
    const optionsContainer = document.createElement("div");
    optionsContainer.setAttribute("class", "input-group");
    this.descriptions.forEach((description, index) => {
      let text = description.value;
      const element = document.createElement("div");
      const className = ["description", "pointer"];
      if (description.id === this.fields.description.value.id) {
        className.push("selected");
        text += " &#10003;";
      }
      element.setAttribute("data-id", description.id);
      element.setAttribute("class", className.join(" "));
      element.innerHTML = text;
      element.onclick = this.handleSelectDescription.bind(this);
      optionsContainer.appendChild(element);

      if (index !== this.descriptions.length - 1) {
        optionsContainer.appendChild(document.createElement("hr"));
      }
    });
    wrapper.appendChild(optionsContainer);
    return wrapper;
  }

  get ClearButton() {
    const element = document.createElement("button");
    element.innerText = "Clear";
    element.setAttribute("class", "btn pointer");
    element.onclick = this.handleOnClear.bind(this);
    return element;
  }

  get NextButton() {
    const element = document.createElement("button");
    const { payee, amount } = this.fields;
    element.setAttribute("class", "btn pointer");
    element.innerText = "Next";
    if (!payee.valid || !amount.valid) {
      element.setAttribute("disabled", true);
    } else {
      element.onclick = this.handleSubmit.bind(this);
    }
    return element;
  }

  get Loading() {
    const element = document.createElement("div");
    const image = document.createElement("img");
    image.setAttribute("src", "/loading.gif");
    image.setAttribute("width", "100");
    image.setAttribute("height", "100");
    element.setAttribute(
      "class",
      "layout-column loading-container center-content"
    );
    element.appendChild(image);
    return element;
  }

  render() {
    this.TitleBar.innerText = this.title;
    const element = document.createElement("div");
    element.setAttribute("class", "transfer-money-form");
    element.appendChild(this.PayeeInput);
    element.appendChild(this.AmountInput);
    element.appendChild(this.MessageInput);
    element.appendChild(this.DescriptionInput);
    this.Content.innerHTML = "";
    this.OptionsBar.innerHTML = "";
    if (this.pending) {
      this.Content.appendChild(this.Loading);
    }
    this.Content.appendChild(element);
    this.OptionsBar.appendChild(this.ClearButton);
    this.OptionsBar.appendChild(this.NextButton);
    super.render();
  }
}

class SendMoneySuccessScreen extends Screen {
  constructor() {
    super();
    this.title = "Send Money";
  }

  render() {
    this.TitleBar.innerText = this.title;
    const element = document.createElement("div");
    const message = document.createElement("div");
    message.innerText = state.successMessage;
    const decoration = document.createElement("div");
    decoration.innerHTML = "&#10004";
    decoration.setAttribute("style", "color: orange;font-size: 12vh;");
    element.appendChild(message);
    element.appendChild(decoration);
    element.setAttribute(
      "class",
      "layout-column center-content transfer-money-success"
    );
    this.Content.innerHTML = "";
    this.OptionsBar.innerHTML = "";
    this.Content.appendChild(element);
    this.OptionsBar.appendChild(SendMoneyButton());
    this.OptionsBar.appendChild(TransactionHistoryButton());
    super.render();
  }
}

//Routing
const routes = {
  home: HomeScreen,
  sendMoney: SendMoneyScreen,
  "sendMoney/success": SendMoneySuccessScreen,
  transactions: TransactionScreen
};

function handleHashChange(event) {
  const route = event.target.location.hash.slice(2);
  const Screen = routes[route];
  let screen = new routes.home();

  if (Screen) {
    screen = new Screen();
  }

  screen.render();
}

handleHashChange({ target: window });

window.onhashchange = handleHashChange;
