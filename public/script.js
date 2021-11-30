const select = document.querySelectorAll('.currency_selector');
const input = document.querySelectorAll('.cunversation');
const apiUrl = "http://data.fixer.io/api/latest?access_key=308530eb3c6cc4b37f0ac98abee5f06d";
let html = '';
async function currency() {
  const res = await fetch(apiUrl);
  const data = await res.json();
  const arrKeys = Object.keys(data.rates);
  const rates = data.rates;
  arrKeys.map(item => {
    return html += '<option  value=' + item + '>' + item + '</option>';
  });
  for (let i = 0; i < select.length; i++) {
    select[i].innerHTML = html;
  };

  input[0].addEventListener('keyup', () => {
    input[1].value = input[0].value * rates[select[1].value] / rates[select[0].value];
  });
  input[1].addEventListener('keyup', () => {
    input[0].value = input[1].value * rates[select[0].value] / rates[select[1].value];
  });
  input[0].addEventListener('change', () => {
    input[1].value = input[0].value * rates[select[1].value] / rates[select[0].value];
  });
  input[1].addEventListener('change', () => {
    input[0].value = input[1].value * rates[select[0].value] / rates[select[1].value];
  });

};

currency();
