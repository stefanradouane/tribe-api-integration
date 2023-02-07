import fetch from 'node-fetch';

const finder = ["name", "surname"]

export const handler = async (event) => {
    const query = event.rawQuery;
    const doubleQuery = query.search("&") == -1 ? false : true // Boolean
    let queryObjects, firstParamValue;

    if(doubleQuery) {
        const firstParam = query.slice(0, query.search("&"))
        const firstQueryType = firstParam.slice(0, firstParam.search("="))
        firstParamValue = firstParam.slice(-(firstParam.length - firstParam.search("=") - 1))

        const secondParam = query.slice(-(query.length - query.search("&") - 1))
        const secondQueryType = secondParam.slice(0, secondParam.search("="))
        let secondParamValue = secondParam.slice(-(secondParam.length - secondParam.search("=") - 1))

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
        const firstQueryType = query.slice(0, query.search("="))
        firstParamValue = query.slice(-(query.length - query.search("=") - 1))
        queryObject = {[firstQueryType]: firstParamValue}
    }

    Object.keys(queryObject).forEach(key => {
        const foundItem = finder.find(item => item == key)
        if(!foundItem) {
          throw "query type name doens't match api field";
        }
    })
    
    let res = await fetch(`https://whois.fdnd.nl/api/v1/members?first=200`)

    let data = await res.json();

    const filteredData = data.members.filter(({name}) => name === firstParamValue)

    return {
      statusCode: 200,
      headers: {
        /* Required for CORS support to work */
        'Access-Control-Allow-Origin': '*',
        /* Required for cookies, authorization headers with HTTPS */
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        data: filteredData
      })
    }
  }