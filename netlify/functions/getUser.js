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
    let queryObject;

    let firstQueryType;
    let firstParamValue;

    let secondQueryType;
    let secondParamValue;

    if(doubleQuery) {
        const firstParam = query.slice(0, query.search("&"))
        firstQueryType = firstParam.slice(0, firstParam.search("="))
        firstParamValue = firstParam.slice(-(firstParam.length - firstParam.search("=") - 1))

        const secondParam = query.slice(-(query.length - query.search("&") - 1))
        secondQueryType = secondParam.slice(0, secondParam.search("="))
        secondParamValue = secondParam.slice(-(secondParam.length - secondParam.search("=") - 1))

        if(secondParamValue.search("&") == -1) {
            secondParamValue = secondParamValue
         } else {
            secondParamValue = secondParamValue.slice(0, secondParamValue.search("&"))
         }

        queryObject = {
            [firstQueryType]: firstParamValue,
            [secondQueryType]: secondParamValue,
        }
    } else if (!doubleQuery) {
        firstQueryType = query.slice(0, query.search("="))
        firstParamValue = query.slice(-(query.length - query.search("=") - 1))
        queryObject = {[firstQueryType]: firstParamValue}
    }

    let errorMessage;
    // Check if query is allowed
    Object.keys(queryObject).forEach(key => {
        const foundItem = finder.find(item => item == key)
        if(!foundItem) {
            errorMessage = { error: 400, reason: "The query type is not supported", fix: "Try a query like: name, surname, nickname" };
            
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
    return string.toLowerCase();
}