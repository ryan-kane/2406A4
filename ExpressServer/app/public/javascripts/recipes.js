function handleSubmit(){
    var in_spices = document.getElementById('spices');
    var in_ingredients = document.getElementById('ingredients');

    var query = {};
    query.ingredients = in_ingredients.value;
    query.spices = in_spices.value;

    if(query.spices != ""  || query.in_ingredients != ""){
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200){
                //Good response from server
                console.log("response");
                handleResults(xhr.responseText);
            }
        }
        xhr.open('POST', `/?spices=${query.spices}&ingredients=${query.ingredients}`, true);
        console.log("sending");
        xhr.send();
    }
}

function handleResults(results){
    //display the data in the JSON object from the server
    var display = document.getElementById("display");
    console.log("results: " + results);
    let i;
    for(i = 0; i < results.recipes.length; i++){
        let name = results.recipes[i].recipe_name;
        let contrib = results.recipes[i].contributor;
        let category = results.recipes[i].category;
        let description = results.recipes[i].description;
        let spices = results.recipes[i].spices;
        let source = results.recipes[i].source;
        let rating = results.recipes[i].rating;
        let ingredients = results.recipes[i].ingredients;
        let directions = results.recipes[i].ingredients;
        //display the recipe in the page
        display.innerHTML += 
        //the link will be to a single recipe page hopefully
        //can render with jade like recipes pagelo
        `<a>
            <li>
                <h4>${name}</h4>
                <h6>By ${contrib}</h6>
                <p>Category: ${category}</p>
                <br>
                <p>${description}</p>
                <br>
                <p>Spices: `;
                let j;
                for(j = 0; j < spices.length; j++){
                    if(j = spices.length - 1){
                        display.innerHTML += `${spices[j]}.`;
                    }else{
                        display.innerHTML += `${spices[j]}, `;
                    }
                }
                `
                </p>
                <br>
                <p>Source: ${source}</p>
                <p>Rating: ${rating}</p>
                <br>
                <p>Ingredients: `;          
                for(j = 0; j < ingredients.length; j++){
                    if(j = ingredients.length - 1){
                        display.innerHTML += `${ingredients[j]}.`;
                    }else{
                        display.innerHTML += `${ingredients[j]}, `;
                    }
                }
                `</p>
                <br>
                <p>${directions}
            </li>
        </a>`;
    }

}