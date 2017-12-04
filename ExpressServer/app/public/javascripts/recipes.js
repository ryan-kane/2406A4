function handleSubmit(){
    var in_spices = document.getElementById('spices');
    var in_ingredients = document.getElementById('ingredients');

    var query = {};
    query.ingredients = in_ingredients.value;
    query.spices = in_spices.value;
    
    console.log(query.ingredients);
    console.log(query.spices);

    xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = () => {
        if(this.readystate == 4 && this.status == 200){
            //Good response from server
            handleResults(JSON.parse(this.responseText));
        }
    }
    if(query.spices != ""  || query.in_ingredients != ""){
        xhttp.open('POST', `/?spices=${query.spices}&ingredients=${query.ingredients}`, true);
        xhttp.send(JSON.stringify(query));
    }
}

function handleResults(results){
    //display the data in the JSON object from the server
}