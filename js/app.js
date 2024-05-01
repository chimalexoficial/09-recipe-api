function startApp() {
    const selectCategories = document.querySelector('#categories');
    selectCategories.addEventListener('change', selectCategory);

    const result = document.querySelector('#result');
    const modal = new bootstrap.Modal('#modal', {});

    getCategories();

    function getCategories() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(res => res.json())
            .then(res => showCategories(res.categories));


    }

    function showCategories(categories = []) {
        categories.forEach(categoria => {
            const { strCategory } = categoria;
            const option = document.createElement('option');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategories.appendChild(option);
        })
    }

    function selectCategory(e) {
        const category = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
        fetch(url)
            .then(res => res.json())
            .then(data => showRecipes(data.meals));

    }

    function showRecipes(recipes = []) {
        cleanHTML(result);

        const heading = document.createElement('h2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recipes.length ? 'Results' : 'No results';
        result.appendChild(heading);

        // Iterating results
        recipes.forEach(recipe => {

            const {idMeal, strMeal, strMealThumb} = recipe;

            const recipeContainer = document.createElement('div');
            recipeContainer.classList.add('col-md-4');
            
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('card', 'mb-4');

            const recipeImage = document.createElement('img');
            recipeImage.classList.add('card-img-top');
            recipeImage.alt = `Recipe image ${strMeal}`;
            recipeImage.src = strMealThumb;

            const recipeCardBody = document.createElement('div');
            recipeCardBody.classList.add('card-body');

            const recipeHeading = document.createElement('h3');
            recipeHeading.classList.add('card-title', 'mb-3');
            recipeHeading.textContent = strMeal;

            const recipeButton = document.createElement('button');
            recipeButton.classList.add('btn', 'btn-danger', 'w-100');
            recipeButton.textContent = 'See recipe';
            // recipeButton.dataset.bsTarget = '#modal';
            // recipeButton.dataset.bsToggle = 'modal';
            recipeButton.onclick = function() {
                selectRecipe(idMeal);
            }

            // HTML injection
           
            recipeCard.appendChild(recipeImage);
            recipeCard.appendChild(recipeCardBody);
            recipeCardBody.appendChild(recipeHeading);
            recipeCardBody.appendChild(recipeButton);
            recipeContainer.appendChild(recipeCard);
            result.appendChild(recipeContainer);
    
        })
    }

    function selectRecipe(id) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(res => res.json())
            .then(res => showRecipeInModal(res.meals[0]));
    }

    function showRecipeInModal(recipe) {
        console.log(recipe);
        // Show modal
        const {idMeal, strInstructions, strMeal, strMealThumb} = recipe;
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document .querySelector('.modal .modal-body');
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}" />
        <h3 class="my-3">Instructions</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Quantity</h3>`

        const listGroup = document.createElement('ul');
        listGroup.classList.add('list-group');
        // Showing ingredients and measure
        for(let i = 1; i <= 20; i++) {
            if(recipe[`strIngredient${i}`]) {
                const ingredient = recipe[`strIngredient${i}`];
                const measure = recipe[`strMeasure${i}`];

                let ingredientLi = document.createElement('li');
                ingredientLi.classList.add('list-group-item');
                ingredientLi.textContent = `${ingredient} - ${measure}`;

                listGroup.appendChild(ingredientLi);
            }
        }

        modalBody.appendChild(listGroup);
        const modalFooter = document.querySelector('.modal-footer');
        cleanHTML(modalFooter);

        // Modal buttons (close/fav)
        const favoriteBtn = document.createElement('button');
        favoriteBtn.classList.add('btn', 'btn-danger', 'col')
        favoriteBtn.textContent = 'Save as favorite';
        modalFooter.appendChild(favoriteBtn);

        // Local Storage
        favoriteBtn.onclick = function() {
            if(storageChecker(idMeal)) {
                return;
            }
            addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            });
        }

        const closeModalBtn = document.createElement('button');
        closeModalBtn.classList.add('btn', 'btn-secondary', 'col')
        closeModalBtn.textContent = 'Close';
        modalFooter.appendChild(closeModalBtn);
        closeModalBtn.onclick = function() {
            modal.hide();
        }

        modal.show();

    }

    function addFavorite(recipe) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        localStorage.setItem('favorites', JSON.stringify([...favorites, recipe]));
    }

    function storageChecker(id) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        return favorites.some(fav => fav.id === id);
    }

    function cleanHTML(selector) {
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }
    }
}


document.addEventListener('DOMContentLoaded', startApp);