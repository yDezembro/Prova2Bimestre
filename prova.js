const filterIcon = document.querySelector('.filter-icon');
const filterDialog = document.getElementById('filter-dialog');
const closeDialogBtn = document.querySelector('.close-dialog');
const filterForm = document.querySelector('.filters-form');
const searchInput = document.querySelector('.header-input');
const newsList = document.getElementById('news-list');
const filterCount = document.querySelector('.filter-count');
const headerInput = document.querySelector('.header-input');
const filterQuantity = document.querySelector('.filter-qtd');
const headerForm = document.querySelector('.header-form')

filterIcon.addEventListener('click', () => {
  filterDialog.showModal();
});

closeDialogBtn.addEventListener('click', (e) => {
  e.preventDefault();
  filterDialog.close();
});

headerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  applyFilters();
})

filterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  applyFilters();
  filterDialog.close();
});

window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('busca')) {
    searchInput.value = params.get('busca');
  }
  filterQuantity.innerText = 0;
  fetchNews();
});

async function fetchNews() {
  const params = new URLSearchParams(window.location.search);
  const cleanParams = params.toString().replace(/&busca=\w{0,}/, '').replace(/&page=\d{0,}/)
  const paramsQuantity = cleanParams ? (cleanParams.match(/&/g) || []).length + 1 : 0;
  filterQuantity.innerHTML = `<strong><p style="margin: 0px; margin-top: 2px">${paramsQuantity}</p></strong>`
  const quantity = params.get('qtd') ?? 10;

  let url = 'https://servicodados.ibge.gov.br/api/v3/noticias';
  params.set('qtd', quantity);
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  displayNews(data.items);
  setupPagination(data.totalPages);
}

function displayNews(newsItems) {
  newsList.innerHTML = '';
  newsItems.forEach((news) => {
    const newsItem = document.createElement('li');
    const imageUrl = JSON.parse(news.imagens).image_intro;
    newsItem.className = 'news-item';

    const imgUrl = `https://agenciadenoticias.ibge.gov.br/${imageUrl}`;
    let editorias = news.editorias.split(';');
    let editoriasParagraph = '';

    editorias.forEach((element) => {
      editoriasParagraph += `#${element} `;
    });

    let publishDate = news.data_publicacao.split(' ')[0].split('/');

    newsItem.innerHTML = `
          <img onclick="window.open('${news.link}', '_blank')" src="${imgUrl}" alt="${news.titulo}" style="cursor: pointer;">
          <h2>${news.titulo}</h2>
          <p>${news.introducao}</p>
          <p>${editoriasParagraph}</p>
          <time>${timeSince(new Date(publishDate[2], publishDate[1], publishDate[0]))}</time>
          <button onclick="window.open('${news.link}', '_blank')">Leia Mais</button>
      `;
    newsList.appendChild(newsItem);
  });
}

function setupPagination(totalPages) {
  const params = new URLSearchParams(window.location.search);
  const currentPage = parseInt(params.get('page') || '1', 10);
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  const maxButtons = 10;
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(currentPage - half, 1);
  let end = Math.min(start + maxButtons - 1, totalPages);

  if (end - start < maxButtons - 1) {
    start = Math.max(end - maxButtons + 1, 1);
  }

  for (let i = start; i <= end; i++) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = i;
    if (i === currentPage) {
      button.id = 'active';
    }
    button.addEventListener('click', () => {
      params.set('page', i);
      window.location.search = params.toString();
    });
    li.appendChild(button);
    pagination.appendChild(li);
  }
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval >= 1) {
    return `Publicado há ${Math.floor(interval)} anos`;
  }
  interval = seconds / 2592000;
  if (interval >= 1) {
    return `Publicado há ${Math.floor(interval)} meses`;
  }
  interval = seconds / 86400;
  if (interval >= 1) {
    return `Publicado há ${Math.floor(interval)} dias`;
  }
  return 'Publicado hoje';
}

function applyFilters() {
  const filterFormData = new FormData(filterForm);
  const headerFormData = new FormData(headerForm)
  const params = new URLSearchParams();
  for (const [key, value] of filterFormData.entries()) {
    if (value) {
      params.append(key, value);
    }
  }
  for (const [key, value] of headerFormData.entries()) {
    if (value) {
      params.append(key, value);
    }
  }
  window.location.search = params.toString();
}
