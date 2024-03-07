// Attend que le DOM soit entièrement chargé avant d'exécuter les scripts
document.addEventListener('DOMContentLoaded', () => {
    initTierList();
    addDragAndDropHandlers();
});

// Initialise la liste de catégories en créant des éléments pour chaque catégorie
const initTierList = () => {
    // Liste des catégories
    const tiers = ['A voir en boucle', 'Se regarde sans modération', 'A voir', 'Ne pas cliquer sur play'];
    // Conteneur où les catégories seront ajoutées
    const container = document.getElementById('tierListContainer');

    // Boucle à travers chaque catégorie pour créer sa structure HTML
    tiers.forEach(tier => {
        // Crée la ligne pour la catégorie
        const tierRow = document.createElement('div');
        tierRow.classList.add('tier-container', 'mb-4', 'bg-mainPurple', 'p-4', 'rounded-lg', 'shadow-md', 'min-h-48');
        // Crée et ajoute le titre de la catégorie
        const tierTitle = document.createElement('h3');
        tierTitle.classList.add('font-bold', 'mb-4', 'text-white');
        tierTitle.textContent = tier;
        // Crée la zone de dépôt pour la catégorie
        const tierDropZone = document.createElement('div');
        tierDropZone.classList.add('drop-zone', 'tier', 'p-4', 'bg-mainPurple', 'rounded-lg', 'text-white');
        tierDropZone.setAttribute('data-tier', tier);
        tierDropZone.innerHTML = `<span class='placeholder placeholder:text-white text-white'>Déposez les films ici</span>`;
        // Ajoute le titre et la zone de dépôt à la ligne de la catégorie, puis ajoute la ligne au conteneur
        tierRow.appendChild(tierTitle);
        tierRow.appendChild(tierDropZone);
        container.appendChild(tierRow);
    });
};

// Configure la fonctionnalité de glisser-déposer pour les éléments déplaçables et les zones de dépôt
const addDragAndDropHandlers = () => {
    // Obtient tous les éléments déplaçables et les zones de dépôt
    const draggables = document.querySelectorAll('.draggable');
    const dropZones = document.querySelectorAll('.drop-zone');
    // Ajoute des écouteurs d'événements de début et de fin de glissement à chaque élément déplaçable
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', e => {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        draggable.addEventListener('dragend', e => {
            e.target.classList.remove('dragging');
        });
    });
    // Active la fonctionnalité de dépôt pour chaque zone de dépôt
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            if (dragging) {
                e.dataTransfer.dropEffect = 'move';
            }
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                zone.appendChild(draggable);
                draggable.classList.remove('dragging');
            }
        });
    });
};

// Fonction pour obtenir l'élément après lequel l'élément glissé doit être placé`
const getDragAfterElement = (container, y) => {
    // Sélectionne tous les éléments draggable dans le conteneur spécifié,
    // à l'exception de celui qui est actuellement en cours de déplacement.
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    // Utilise la méthode reduce pour trouver l'élément le plus proche de la position verticale du curseur (y).
    // `closest` garde une trace de l'élément le plus proche trouvé jusqu'à présent et de sa distance verticale
    // par rapport au curseur.
    return draggableElements.reduce((closest, child) => {
        // Récupère le rectangle englobant de l'élément enfant, qui fournit ses dimensions et sa
        // position relative au viewport.
        const box = child.getBoundingClientRect();
        // Calcule la distance verticale (offset) entre le milieu de l'élément enfant et la position verticale
        // du curseur (y).
        const offset = y - box.top - box.height / 2;
        // Si cette distance est inférieure à zéro (indiquant que le curseur est au-dessus du milieu de l'élément)
        // et plus grande que la distance de l'élément le plus proche actuellement enregistré, cet élément devient
        // le nouvel élément le plus proche.
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            // Sinon, retourne l'élément le plus proche actuellement enregistré sans changement.
            return closest;
        }
    }, {
        // Initialise `closest` avec une distance infiniment négative pour s'assurer que le premier élément
        // testé deviendra le plus proche par défaut.
        offset: Number.NEGATIVE_INFINITY
    }).element;
};

// Fonction asynchrone pour rechercher des films à partir d'une API en fonction de la requête de recherche
const searchMovies = async (query) => {
    try {
        const response = await fetch(`${config.API_URL}?api_key=${config.API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
};

// Fonction pour ajouter un film sélectionné à la zone de sélection
const addMovieToSelection = (movie) => {
    const selectionZone = document.getElementById('selectionZone');

    // Crée le conteneur pour le film avec draggable=true
    const movieElement = document.createElement('div');
    movieElement.setAttribute('draggable', true);
    movieElement.classList.add('shadow-xl','draggable', 'max-w-xs','p-2', 'bg-mainPink', 'rounded', 'cursor-move', 'mb-2', 'flex', 'items-center');
    movieElement.dataset.title = movie.title;

    // Crée et ajoute l'image du film
    const movieImage = document.createElement('img');
    movieImage.src = `https://image.tmdb.org/t/p/w92${movie.poster_path}`;
    movieImage.alt = `${movie.title} poster`;
    movieImage.classList.add('mr-2');
    // Empêchez le drag de l'image seule
    movieImage.addEventListener('dragstart', (e) => e.preventDefault());

    // Crée et ajoute le titre du film
    const movieTitle = document.createElement('span');
    movieTitle.textContent = movie.title;

    // Crée le bouton de suppression
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('delete-btn', 'bg-red-500', 'text-white', 'p-1', 'rounded');
    deleteButton.style.marginLeft = 'auto';
    deleteButton.addEventListener('click', () => movieElement.remove());

    // Ajoute les éléments à movieElement
    movieElement.appendChild(movieImage);
    movieElement.appendChild(movieTitle);
    movieElement.appendChild(deleteButton);

    // Ajoute movieElement à la zone de sélection
    selectionZone.appendChild(movieElement);

    // Appelez addDragAndDropHandlers ici pour s'assurer que les nouveaux éléments sont interactifs.
    addDragAndDropHandlers();
};

// Fonction de temporisation pour éviter des appels trop fréquents à l'API lors de la saisie dans le champ de recherche
const debounce = (func, wait, immediate) => {
    let timeout;
    return function() {
        // "this" et "arguments" se réfèrent au contexte et aux arguments de la fonction "func" lors de son appel
        const context = this, args = arguments;
        // "later" est une fonction qui sera appelée plus tard, après le délai d'attente "wait"
        const later = function () {
            timeout = null;
            // Si "immediate" est faux, alors exécuter la fonction "func" avec le contexte et les arguments originaux
            if (!immediate) func.apply(context, args);
        };
        // "callNow" est vrai si "immediate" est vrai et "timeout" n'a pas encore été défini
        const callNow = immediate && !timeout;
        // Annule le délai d'attente précédent s'il existe
        clearTimeout(timeout);
        // Définit un nouveau délai d'attente
        timeout = setTimeout(later, wait);
        // Si "callNow" est vrai, exécuter immédiatement la fonction "func" avec le contexte et les arguments originaux
        if (callNow) func.apply(context, args);
    };
};

// Fonction asynchrone pour effectuer une recherche et afficher les résultats
const performSearch = async () => {
    const query = document.getElementById('searchInput').value;
    if (query.length < 3) { // Attendre au moins 3 caractères pour lancer la recherche
        document.getElementById('autocompleteResults').classList.add('hidden');
        return;
    }
    const movies = await searchMovies(query);
    displayAutocompleteResults(movies);
}

document.getElementById('searchInput').addEventListener('input', debounce(performSearch, 500));

// Affichage des résultats de l'autocomplétion
const displayAutocompleteResults = (movies) => {
    const autocompleteResultsElement = document.getElementById('autocompleteResults');
    const searchInput = document.getElementById('searchInput');
    autocompleteResultsElement.innerHTML = '';
    autocompleteResultsElement.classList.remove('hidden');

    movies.forEach(movie => {
        const resultElement = document.createElement('div');
        resultElement.classList.add('flex', 'items-center', 'p-2', 'hover:bg-mainPink', 'cursor-pointer');
        resultElement.onclick = function() {
            addMovieToSelection(movie);
            autocompleteResultsElement.classList.add('hidden');
            searchInput.value = '';
        };

        const movieImage = document.createElement('img');
        movieImage.src = `https://image.tmdb.org/t/p/w92${movie.poster_path}`;
        movieImage.alt = `${movie.title} poster`;
        movieImage.classList.add('mr-2');

        const movieDetails = document.createElement('div');
        const movieTitle = document.createElement('span');
        movieTitle.textContent = `${movie.title} (${movie.release_date.split('-')[0]})`;
        movieDetails.appendChild(movieTitle);

        resultElement.appendChild(movieImage);
        resultElement.appendChild(movieDetails);
        autocompleteResultsElement.appendChild(resultElement);
    });
};

// Affichage des résultats de l'autocomplétion
const displaySearchResults = (movies) => {
    const searchResultsElement = document.getElementById('searchResults');
    searchResultsElement.innerHTML = ''; // Nettoie les résultats précédents

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('search-result', 'p-2', 'bg-gray-100', 'rounded', 'cursor-pointer', 'flex', 'items-center', 'mb-2');
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w92${movie.poster_path}" alt="${movie.title} poster" class="mr-2">
            <div>
                <span>${movie.title}</span>
                <span> (${movie.release_date.split('-')[0]})</span>
            </div>
        `;

        // Attache un gestionnaire d'événements pour ajouter le film à la sélection sur clic
        movieElement.addEventListener('click', () => {
            addMovieToSelection(movie);
            console.log('click sur liste');
            clearSearchResults(); // Appelle une fonction pour vider/cacher les résultats de recherche
        });

        searchResultsElement.appendChild(movieElement);
    });
};

// Fonction pour vider les résultats de recherche
const clearSearchResults = () => {
    const autocompleteResultsElement = document.getElementById('autocompleteResults');
    console.log("Clearing search results"); // Ajoutez ceci pour le débogage
    autocompleteResultsElement.innerHTML = ''; // Vide les résultats de recherche d'autocomplétion
};
