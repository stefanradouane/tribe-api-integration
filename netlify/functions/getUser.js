import fetch from 'node-fetch';

const finder = ["name", "surname", "nickname", "id", "slug"]

export const handler = async (event) => {
    const query = event.rawQuery == "" ? false : event.rawQuery ;
    let firstRes = await fetch(`https://whois.fdnd.nl/api/v1/members?first=100`)
    let secondRes = await fetch(`https://whois.fdnd.nl/api/v1/members?first=100&skip=100`)


    let firstData = await firstRes.json();
    let secondData = await secondRes.json();

    let dataArray = firstData.members.concat(secondData.members)

    let data = {
        members: dataArray
    }

    if(query) {
    const doubleQuery = query.search("&") == -1 ? false : true // Boolean
    let queryObject = {};

    let firstQueryType;
    let firstParamValue;

    let secondQueryType;
    let secondParamValue;

    if(doubleQuery) {
        const queryArray = query.split("&");
    
    if (queryArray.length >= 2) {    
      const firstParam = queryArray[0].split("=");
      const secondParam = queryArray[1].split("=");
      firstQueryType = firstParam[0]
      firstParamValue = firstParam[1]
      secondQueryType = secondParam[0]
      secondParamValue = secondParam[1]
      
      queryObject[firstQueryType] = firstParamValue;
      queryObject[secondQueryType] = secondParamValue;
     }
    } else if (!doubleQuery) {
        const param = query.split("=");
        firstQueryType = param[0]
        firstParamValue = param[1]
        queryObject = {[firstQueryType]: firstParamValue}
    }

    let errorMessage;
    // Check if query is allowed
    Object.keys(queryObject).forEach(key => {
        const foundItem = finder.find(item => item == key)
        if(!foundItem) {
            if(!queryObject[key]){
                return
            } else {
                errorMessage = queryObject
                // errorMessage = { error: 400, reason: "The query type is not supported", fix: "Try a query like: name, surname, nickname" };
            }
            
        } else if (foundItem) {
            if(doubleQuery){
                if (key == "nickname" || key == "id" || key == "slug") {
                    errorMessage = { error: 400, reason: "This query type is not supported when using a double query type", fix: "Try a query with a double querytype like: ?name=YOURNAME&surname=YOURSURNAME" }
                }     
            } 
        }
    })

    if(errorMessage){
        return {
            statusCode: 400,
            headers: {
              /* Required for CORS support to work */
              'Access-Control-Allow-Origin': '*',
              /* Required for cookies, authorization headers with HTTPS */
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
              data: errorMessage
            })
        }
    }
    
    

    
    if(doubleQuery) {
        // Supports: Name and Surname;low
        const usedData = data.members.filter(({name, surname}) => lowerCase(name) === lowerCase(firstParamValue) && lowerCase(surname) === lowerCase(secondParamValue));
        return {
            statusCode: 200,
            headers: {
              /* Required for CORS support to work */
              'Access-Control-Allow-Origin': '*',
              /* Required for cookies, authorization headers with HTTPS */
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
              data: usedData
            })
          }
    }
    
    // Supports: Name / surname / nickname / id ;
    const usedData = data.members.filter(( item ) => lowerCase(item[firstQueryType]) === lowerCase(firstParamValue))

    return {
        statusCode: 200,
        headers: {
          /* Required for CORS support to work */
          'Access-Control-Allow-Origin': '*',
          /* Required for cookies, authorization headers with HTTPS */
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          data: usedData
        })
      }

    }

    return {
        statusCode: 200,
        headers: {
          /* Required for CORS support to work */
          'Access-Control-Allow-Origin': '*',
          /* Required for cookies, authorization headers with HTTPS */
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          data: data
        })
      }

    
  }


function lowerCase(string) {
    if(!string) {
        return string
    }
    return string.toLowerCase();
}